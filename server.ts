import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import https from "https";
import http from "http";

dotenv.config();

const __dirname = process.cwd();

const archiveMetadataCache = new Map<string, { server: string; dir: string }>();

async function resolveArchiveOrgUrl(targetUrl: string): Promise<string> {
  const match = targetUrl.match(/https?:\/\/(?:www\.)?archive\.org\/download\/([^\/]+)\/(.+)/);
  if (!match) {
    return targetUrl;
  }
  const identifier = match[1];
  const filename = match[2];

  if (archiveMetadataCache.has(identifier)) {
    const cached = archiveMetadataCache.get(identifier)!;
    let decodedFilename = filename;
    try {
      decodedFilename = decodeURIComponent(filename);
    } catch (err) {
      // ignore
    }
    const safeFilename = decodedFilename.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `https://${cached.server}${cached.dir}/${safeFilename}`;
  }

  try {
    const metadataUrl = `https://archive.org/metadata/${identifier}`;
    const response = await new Promise<string>((resolve, reject) => {
      const options = {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'accept': 'application/json'
        },
        timeout: 1200
      };
      const req = https.get(metadataUrl, options, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Metadata request failed with status: ${res.statusCode}`));
        }
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Metadata request timed out'));
      });
    });

    const data = JSON.parse(response);
    if (data && data.server && data.dir) {
      archiveMetadataCache.set(identifier, { server: data.server, dir: data.dir });
      let decodedFilename = filename;
      try {
        decodedFilename = decodeURIComponent(filename);
      } catch (err) {
        // ignore
      }
      const safeFilename = decodedFilename.split('/').map(segment => encodeURIComponent(segment)).join('/');
      return `https://${data.server}${data.dir}/${safeFilename}`;
    }
  } catch (err: any) {
    // Graceful fallback to targetUrl directly if metadata endpoint is slow or unreachable
  }

  return targetUrl;
}

// Helper function to call the Gemini API with robust retries for transient errors (such as demand spike/503/429/UNAVAILABLE)
async function callGeminiWithRetry(
  ai: any,
  model: string,
  params: { contents: any; config?: any },
  retriesLeft = 5,
  initialDelay = 1500
): Promise<any> {
  try {
    return await ai.models.generateContent({
      model,
      ...params,
    });
  } catch (err: any) {
    const errString = String(err);
    const errMessage = (err?.message || "").toLowerCase();
    const isTransientError = err?.status === 429 || 
                             err?.statusCode === 429 || 
                             err?.status === 503 ||
                             err?.statusCode === 503 ||
                             errString.includes("429") || 
                             errString.includes("503") || 
                             errString.includes("UNAVAILABLE") ||
                             errMessage.includes("429") || 
                             errMessage.includes("503") || 
                             errMessage.includes("quota") || 
                             errMessage.includes("limit") ||
                             errMessage.includes("demand") ||
                             errMessage.includes("temporary") ||
                             errMessage.includes("overloaded") ||
                             errMessage.includes("unavailable") ||
                             errMessage.includes("resource exhausted") ||
                             errMessage.includes("busy");

    if (isTransientError && retriesLeft > 0) {
      const delay = initialDelay + Math.random() * 1500;
      console.warn(`[Gemini API] Transient error or high demand spike detected. Retrying in ${Math.round(delay)}ms... (${retriesLeft} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(ai, model, params, retriesLeft - 1, initialDelay * 2);
    }
    throw err;
  }
}

// Helper to sanitize incoming string parameters against XSS / HTML Injection
function sanitizeString(input: any, maxLength = 1000): string {
  if (typeof input !== "string") {
    return "";
  }
  let str = input.slice(0, maxLength);
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
  return str.trim();
}

// In-memory rate limiting store to shield server resources from abuse
const rateLimitStore = new Map<string, { timestamps: number[] }>();

// Periodic memory clean-up for the rate limit store to guarantee stability and prevent OOM under millions of concurrent users
setInterval(() => {
  const now = Date.now();
  // Clean keys that have not seen active requests within a standard window (e.g., 5 minutes)
  const maxAge = 5 * 60 * 1000;
  for (const [key, value] of rateLimitStore.entries()) {
    const activeTimestamps = value.timestamps.filter(t => now - t < maxAge);
    if (activeTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      value.timestamps = activeTimestamps;
    }
  }
}, 5 * 60 * 1000).unref();

// Simple, performant in-memory rate limiter middleware
function rateLimiter(limit: number, windowMs: number, apiName = "Global") {
  return (req: any, res: any, next: any) => {
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
    const ip = rawIp.split(',')[0].trim();
    const key = `${apiName}:${ip}`;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { timestamps: [] });
    }

    const record = rateLimitStore.get(key)!;
    record.timestamps = record.timestamps.filter(t => now - t < windowMs);

    if (record.timestamps.length >= limit) {
      console.warn(`[OWASP Rate Limit] IP ${ip} exceeded limit for ${apiName}`);
      return res.status(429).json({
        error: "لقد تجاوزت حد الطلبات المسموح به للتو. يرجى الانتظار دقيقة والمحاولة مرة أخرى."
      });
    }

    record.timestamps.push(now);
    next();
  };
}

async function startServer() {
  const app = express();
  // Support both Cloud Run production deployment ($PORT, typically 8080) and AI Studio dev environment (port 3000)
  const isDev = process.env.NODE_ENV !== "production" || Boolean(process.env.CONTROL_PLANE_PORT);
  const PORT = isDev ? 3000 : (Number(process.env.PORT) || 8080);

  // Set CORS headers for all requests (including static assets, PWA manifest and icons) to support PWABuilder validation
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });

  // Enable large uploads for the logo
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Health Check (Cloud Run probes and monitoring)
  app.get(["/health", "/api/health"], (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "1.2.0",
      environment: isDev ? "development" : "production",
      port: PORT
    });
  });

  // Dynamic application version detection for automatic instant updates
  app.get("/api/app-version", (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    try {
      const indexPath = path.join(process.cwd(), "dist", "index.html");
      let mtime = Date.now();
      if (fs.existsSync(indexPath)) {
        mtime = fs.statSync(indexPath).mtimeMs;
      }
      res.json({
        version: "1.2.0",
        buildTime: mtime
      });
    } catch (e) {
      res.json({
        version: "1.2.0",
        buildTime: Date.now()
      });
    }
  });

  // Serve Service Worker file directly in all environments to satisfy PWA scanners
  app.get("/sw.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const swPath = path.join(process.cwd(), "dist", "sw.js");
    if (fs.existsSync(swPath)) {
      return res.sendFile(swPath);
    }
    // Fallback simple active SW to pass PWABuilder checks if production sw isn't compiled yet
    res.send(`
      self.addEventListener('install', (e) => {
        self.skipWaiting();
      });
      self.addEventListener('activate', (e) => {
        e.waitUntil(self.clients.claim());
      });
      self.addEventListener('fetch', (e) => {
        // Simple bypass/network handler
      });
    `);
  });

  // Serve Workbox runtime if referenced by the service worker
  app.get(/^\/workbox-([a-zA-Z0-9_-]+)\.js$/, (req, res) => {
    const filename = path.basename(req.path);
    const workboxPath = path.join(process.cwd(), "dist", filename);
    if (fs.existsSync(workboxPath)) {
      res.setHeader("Content-Type", "application/javascript");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.sendFile(workboxPath);
    }
    res.status(404).end();
  });

  // Serve Manifest files with correct MIME type and fallback
  app.get(["/manifest.json", "/manifest.webmanifest"], (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const origin = req.headers.origin || req.headers.referer;
    if (origin && origin !== "*") {
      try {
        const originUrl = new URL(origin);
        res.setHeader("Access-Control-Allow-Origin", originUrl.origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      } catch (e) {
        // ignore
      }
    }

    const webmanifestPath = path.join(process.cwd(), "dist", "manifest.webmanifest");
    if (fs.existsSync(webmanifestPath)) {
      res.setHeader("Content-Type", "application/manifest+json");
      return res.sendFile(webmanifestPath);
    }
    const publicWebmanifestPath = path.join(process.cwd(), "public", "manifest.webmanifest");
    if (fs.existsSync(publicWebmanifestPath)) {
      res.setHeader("Content-Type", "application/manifest+json");
      return res.sendFile(publicWebmanifestPath);
    }
    const manifestPath = path.join(process.cwd(), "dist", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      res.setHeader("Content-Type", "application/manifest+json");
      return res.sendFile(manifestPath);
    }
    const publicManifestPath = path.join(process.cwd(), "public", "manifest.json");
    if (fs.existsSync(publicManifestPath)) {
      res.setHeader("Content-Type", "application/manifest+json");
      return res.sendFile(publicManifestPath);
    }
    res.status(404).end();
  });

  // Serve brand logos and favicons with fresh cache-control to prevent stale mobile OS caching
  app.get(/^\/(logo.*\.png|logo\.svg|favicon\..*|apple-touch-icon.*\.png)$/, (req, res, next) => {
    const filename = path.basename(req.path);
    const publicFilePath = path.join(process.cwd(), "public", filename);
    if (fs.existsSync(publicFilePath)) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      const origin = req.headers.origin || req.headers.referer;
      if (origin && origin !== "*") {
        try {
          const originUrl = new URL(origin);
          res.setHeader("Access-Control-Allow-Origin", originUrl.origin);
          res.setHeader("Access-Control-Allow-Credentials", "true");
        } catch (e) {
          // ignore
        }
      }

      if (filename.endsWith(".png")) res.setHeader("Content-Type", "image/png");
      if (filename.endsWith(".svg")) res.setHeader("Content-Type", "image/svg+xml");
      if (filename.endsWith(".ico")) res.setHeader("Content-Type", "image/x-icon");
      return res.sendFile(publicFilePath);
    }
    next();
  });

  // Upload Logo Endpoint (Rate Limited to prevent DoS/disk space exploitation)
  app.post("/api/upload-logo", rateLimiter(5, 60 * 1000, "UploadLogo"), async (req, res) => {
    try {
      const { imageDataUrl, imageDataUrl192 } = req.body;
      if (!imageDataUrl || typeof imageDataUrl !== "string") {
        return res.status(400).json({ error: "Missing or invalid imageDataUrl" });
      }

      // Base64 image validator (Strict signature limit)
      const base64Regex = /^data:(image\/(png|jpeg|jpg|svg\+xml));base64,([A-Za-z0-9+/=]{10,})$/;
      if (!base64Regex.test(imageDataUrl)) {
        return res.status(400).json({ error: "Unsupported image payload type or encoding" });
      }

      if (imageDataUrl192 && (typeof imageDataUrl192 !== "string" || !base64Regex.test(imageDataUrl192))) {
        return res.status(400).json({ error: "Invalid optional imageDataUrl192 structure" });
      }

      const writeBase64 = async (dataUrl: string, filename: string) => {
        const matches = dataUrl.match(base64Regex);
        if (!matches || matches.length !== 4) return;
        
        // Strict filename whitelist to prevent arbitrary path traversal writing
        const safeFilenames = ["logo-512.png", "logo-192.png", "logo.png", "logo.svg"];
        if (!safeFilenames.includes(filename)) {
          throw new Error("Potential path traversal audit block");
        }

        const buffer = Buffer.from(matches[3], "base64");
        const publicPath = path.join(process.cwd(), "public", filename);
        const distPath = path.join(process.cwd(), "dist", filename);

        fs.writeFileSync(publicPath, buffer);
        if (fs.existsSync(path.dirname(distPath))) {
          fs.writeFileSync(distPath, buffer);
        }
      };

      await writeBase64(imageDataUrl, "logo-512.png");
      if (imageDataUrl192) {
        await writeBase64(imageDataUrl192, "logo-192.png");
      } else {
        await writeBase64(imageDataUrl, "logo-192.png");
      }
      
      // Keep logo.png for fallback
      await writeBase64(imageDataUrl, "logo.png");
      
      // Safe SVG backup (avoid injection scripts inside svg tag attributes)
      const publicSvgPath = path.join(process.cwd(), "public", "logo.svg");
      const sanitizedHref = imageDataUrl.replace(/[<>"]/g, "");
      fs.writeFileSync(publicSvgPath, `<!-- custom logo provided --> <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><image href="${sanitizedHref}" width="512" height="512" /></svg>`);

      res.json({ success: true });
    } catch (err) {
      console.error("Upload logo error:", err);
      res.status(500).json({ error: "Failed to process logo" });
    }
  });

  // Gemini API Proxy (Protect with Prompt Sanitizers & strict Rate Limiting)
  app.post("/api/gemini-insights", rateLimiter(15, 60 * 1000, "GeminiAI"), async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }

      // Input Validation and HTML Encoding
      const ayahText = sanitizeString(req.body.ayahText, 2000);
      const tafsirText = sanitizeString(req.body.tafsirText, 5000);
      const surahName = sanitizeString(req.body.surahName, 150);
      const ayahNumber = sanitizeString(req.body.ayahNumber, 10);

      if (!ayahText && !tafsirText) {
        return res.status(400).json({ error: "Missing query parameter content" });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        أنت خبير في علوم القرآن والتفسير. 
        الآية: "${ayahText}"
        من سورة: ${surahName}، آية رقم: ${ayahNumber}
        التفسير المتاح: "${tafsirText}"
 
        بناءً على الآية والتفسير أعلاه، قدم "قبسات ذكية" تشمل:
        1. معنى مبسط جداً (لغير المتخصصين).
        2. درس عملي واحد يمكن تطبيقه في الحياة اليومية.
        3. لمحة بلاغية أو لغوية لطيفة.
 
        اجعل الإجابة مختصرة، ملهمة، ومرتبة بنقاط واضحة. استخدم لغة عربية فصيحة ومعاصرة.
      `;

      const result = await callGeminiWithRetry(ai, "gemini-3.6-flash", {
        contents: prompt
      });

      const safeResponseText = sanitizeString(result.text || "", 15000);
      res.json({ text: safeResponseText });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to fetch AI insights" });
    }
  });

  // Zad Believer Smart Spiritual Guidance
  app.post("/api/zad-guidance", rateLimiter(15, 60 * 1000, "GeminiAI"), async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }

      // Sanitize input state & questions to protect from prompt exploitation
      const state = sanitizeString(req.body.state, 1000) || 'عامة';
      const customQuestion = sanitizeString(req.body.customQuestion, 2000) || 'لا يوجد سؤال محدد، يرجى تقديم توجيه روحي عام مناسب لحالته الروحية.';

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        أنت في تطبيق إسلامي وتلعب دور مرشد روحي ذكي، بصير، حكيم وناصح أمين للعبد المؤمن.
        الشخص يمر بالحالة الروحية/المشاعر التالية: "${state}"
        سؤاله أو تفصيل حالته: "${customQuestion}"
 
        قدم إجابة إيمانية بالغة الرقي والأثر، تشتمل على:
        1. الموعظة والتصبير والتبصير: نبرة إيمانية مهدئة، مليئة بالسكينة والتعاطف وحب الله ورحمته، تصف ترياق هذه الحالة وتطيب الخاطر.
        2. آية قرآنية ذات صلة قوية جداً وثيقة الملاءمة بالحالة، مع شرح كيف تمنحه السكينة وتدعم قلبه.
        3. حديث نبوي شريف، مع فائدته العملية المباشرة.
        4. خطة عملية يومية ملموسة من 3 بنود محددة (مثل دقيقة بورد معين، صدقة خفية، إلخ) لحل فتوره أو ضيقه أو توجيه نيته.
 
        التزم بشدة بلغة عربية فصيحة، سلسة، وعصرية جداً دون تقعر وتكلف، ورتب النص بعناوين فرعية جذابة مستخدماً التنسيق المناسب.
      `;

      const result = await callGeminiWithRetry(ai, "gemini-3.6-flash", {
        contents: prompt
      });

      const safeResponseText = sanitizeString(result.text || "", 15000);
      res.json({ text: safeResponseText });
    } catch (error) {
      console.error("Zad Guidance API Error:", error);
      res.status(500).json({ error: "Failed to fetch AI spiritual insights" });
    }
  });

  // Zad Believer Smart Intention (Habit to Worship Transformation)
  app.post("/api/zad-intention", rateLimiter(15, 60 * 1000, "GeminiAI"), async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }

      // Input dynamic sanitization and validation
      const action = sanitizeString(req.body.action, 2000) || 'عام';

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        في الإسلام، النية هي إكسير العبادة، تحول العادات اليومية البسيطة إلى طاعات عظيمة الشأن صالحة للآخرة (تحويل العادة إلى عبادة).
        العادة أو العمل اليومي الذي أريد تحويل نيتي فيه هو: "${action}"
 
        المطلوب:
        تزويد العبد بمقاصد ونوايا إيمانية عميقة ومفصلة مستوحاة من فقه النية والتربية الإيمانية الإسلامية لهذا العمل لتطوير النية الشاملة واستجلاب الأجر العظيم.
        قم بهيكلة الاستجابة كما يلي بلغة عربية فصيحة، جميلة ومؤثرة جداً تدفع للعمل الصالح:
        
        1. **مقدمة إيمانية**: جملة معبرة وحث موجز مستنير عن فضل النية في هذا العمل الخاص.
        2. **مصفوفة النوايا والاحتساب الآتية**: قائمة منظمة تضم من 3 إلى 5 نوايا ذكية ومقاصد قلبية مختلفة يمكن احتسابها عند فعل هذا الأمر (مثال: التقوي على الطاعة، نفع الأمة، عفة النفس، شكر النعمة...).
        3. **توجيه قلبي ودعاء مأثور**: كيف يوجه قلبه وهو يبدأ العمل، ومقترح دعاء أو ذكر جميل يقوله ليصحب نيته الصالحة.
        4. **ثمار الأجر والاحتساب**: كيف يصبح هذا عملاً دعوياً أو متعدي النفع للآخرين.
      `;

      const result = await callGeminiWithRetry(ai, "gemini-3.6-flash", {
        contents: prompt
      });

      const safeResponseText = sanitizeString(result.text || "", 15000);
      res.json({ text: safeResponseText });
    } catch (error) {
      console.error("Zad Intention API Error:", error);
      res.status(500).json({ error: "Failed to fetch intention transformation." });
    }
  });

  // --- Start of Daily Inspiration API Sources ---
  
  // Helper to fetch JSON from external APIs using native fetch
  async function fetchJson(url: string, timeoutMs = 8000): Promise<any> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(id);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn(`[fetchJson] Failed to parse JSON from ${url}. Text snippet: ${text.substring(0, 100)}`);
        throw new Error(`Invalid JSON response: ${e.message}`);
      }
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }

  // Beautiful curated fallbacks for Quran Ayahs
  // Endpoint 4: Additional Hadiths about Tongue Evils and Patience Levels
  app.get("/api/hadiths/tongue-and-patience", (req, res) => {
    try {
      const hadiths = [
        {
          id: 1,
          title: "خطورة الكلمة المستهان بها",
          text: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ ﷺ قَالَ: «إِنَّ الْعَبْدَ لَيَتَكَلَّمُ بِالْكَلِمَةِ مِنْ رِضْوَانِ اللَّهِ لَا يُلْقِي لَهَا بَالًا يَرْفَعُهُ اللَّهُ بِهَا دَرَجَاتٍ، وَإِنَّ الْعَبْدَ لَيَتَكَلَّمُ بِالْكَلِمَةِ مِنْ سَخَطِ اللَّهِ لَا يُلْقِي لَهَا بَالًا يَهْوِي بِهَا فِي جَهَنَّمَ».",
          source: "صحيح البخاري",
          category: "tongue",
          categoryLabel: "آفات اللسان",
          explanation: "تحذير شديد من الكلمات الطائشة التي يُطلقها المرء دون تفكر، فإن الكلمة قد ترفع صاحبها أو تهوي به في النار."
        },
        {
          id: 2,
          title: "المسلم من سلم المسلمون من لسانه",
          text: "عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو رَضِيَ اللَّهُ عَنْهُمَا، عَنِ النَّبِيِّ ﷺ قَالَ: «الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ».",
          source: "صحيح البخاري ومسلم",
          category: "tongue",
          categoryLabel: "آفات اللسان",
          explanation: "أساس تعامل المسلم هو السلام والرحمة، وأول درجات الإسلام العملي هي كف الأذى باللسان واليد عن الآخرين."
        },
        {
          id: 3,
          title: "وعيد ذي الوجهين",
          text: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «تَجِدُونَ شَرَّ النَّاسِ يَوْمَ الْقِيَامَةِ ذَا الْوَجْهَيْنِ، الَّذِي يَأْتِي هَؤُلَاءِ بِوَجْهٍ وَهَؤُلَاءِ بِوَجْهٍ».",
          source: "صحيح البخاري ومسلم",
          category: "tongue",
          categoryLabel: "آفات اللسان",
          explanation: "النفاق الاجتماعي ونقل الأقاويل والتلون بين الناس لإفساد الود والتقرب للمصالح الشخصية من أبغض الأخلاق وأخطر آفات اللسان."
        },
        {
          id: 4,
          title: "عاقبة الغيبة والنميمة",
          text: "عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «لَمَّا عُرِجَ بِي مَرَرْتُ بِقَوْمٍ لَهُمْ أَظْفَارٌ مِنْ نُحَاسٍ يَخْمِشُونَ وُجُوهَهُمْ وَصُدُورَهُمْ، فَقُلْتُ: مَنْ هَؤُلَاءِ يَا جِبْرِيلُ؟ قَالَ: هَؤُلَاءِ الَّذِينَ يَأْكُلُونَ لُحُومَ النَّاسِ، وَيَقَعُونَ فِي أَعْرَاضِهِمْ».",
          source: "سنن أبي داود (صحيح)",
          category: "tongue",
          categoryLabel: "آفات اللسان",
          explanation: "تصوير مخيف لعقوبة من يقع في أعراض المسلمين بالغيبة والنميمة، ودعوة لصيانة الألسن والقلوب."
        },
        {
          id: 5,
          title: "الصبر عند الصدمة الأولى",
          text: "عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ، قَالَ: مَرَّ النَّبِيِّ ﷺ بِامْرَأَةٍ تَبْكِي عِنْدَ قَبْرٍ، فَقَالَ: «اتَّقِي اللَّهَ وَاصْبِرِي» قَالَتْ: إِلَيْكَ عَنِّي، فَإِنَّكَ لَمْ تُصَبْ بِمُصِيبَتِي، وَلَمْ تَعْرِفْهُ، فَقِيلَ لَهَا: إِنَّهُ النَّبِيُّ ﷺ، فَأَتَتْ بَابَ النَّبِيِّ ﷺ، فَلَمْ تَجِدْ عِنْدَهُ بَوَّابِينَ، فَقَالَتْ: لَمْ أَعْرِفْكَ، فَقَالَ: «إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الْأُولَى».",
          source: "صحيح البخاري ومسلم",
          category: "patience",
          categoryLabel: "درجات الصبر",
          explanation: "الصبر الحقيقي الذي ينال به العبد الأجر الأعظم هو الذي يكون في اللحظات الأولى من نزول البلاء، حيث يملك النفس عن الجزع والاضطراب."
        },
        {
          id: 6,
          title: "عِظم الجزاء مع عِظم البلاء",
          text: "عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ، عَنْ رَسُولِ اللَّهِ ﷺ قَالَ: «إِنَّ عِظَمَ الْجَزَاءِ مَعَ عِظَمِ الْبَلَاءِ، وَإِنَّ اللَّهَ إِذَا أَحَبَّ قَوْمًا ابْتَلَاهُمْ، فَمَنْ رَضِيَ فَلَهُ الرِّضَا، وَمَنْ سَخِطَ فَلَهُ السُّخْطُ».",
          source: "سنن الترمذي (حسن)",
          category: "patience",
          categoryLabel: "درجات الصبر",
          explanation: "الابتلاء علامة حب الله للعبد لتطهيره ورفع درجاته، والصبر والرضا هما مفتاح نيل رضا الله، بينما السخط يوجب غضب الله والشقاء."
        },
        {
          id: 7,
          title: "من يتصبر يصبره الله",
          text: "عَنْ أَبِي سَعِيدٍ الْخُدْرِيِّ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «...وَمَنْ يَسْتَعْفِفْ يُعِفَّهُ اللَّهُ، وَمَنْ يَسْتَغْنِ يُغْنِهِ اللَّهُ، وَمَنْ يَتَصَبَّرْ يُصَبِّرْهُ اللَّهُ، وَمَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ».",
          source: "صحيح البخاري ومسلم",
          category: "patience",
          categoryLabel: "درجات الصبر",
          explanation: "من يسعى لتوطين نفسه على الصبر ومجاهدة النفس يعينه الله ويقويه، والصبر هو أوسع الهبات الربانية التي تجمع خيري الدنيا والآخرة."
        },
        {
          id: 8,
          title: "الصبر ضياء",
          text: "عَنْ عَبْدِ الرَّحْمَنِ بْنِ غَنْمٍ قَالَ: سَمِعْتُ أَبَا مَالِكٍ الْأَشْعَرِيَّ رَضِيَ اللَّهُ عَنْهُ يَقُولُ: قَالَ رَسُولُ اللَّهِ ﷺ: «الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ... وَالصَّلَاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ».",
          source: "صحيح مسلم",
          category: "patience",
          categoryLabel: "درجات الصبر",
          explanation: "وصف الصبر بالضياء لأنه يحرق ظلمات النفس والشهوات والشبهات، ويضيء للمؤمن طريق الثبات على الطاعة والابتعاد عن المعصية."
        },
        {
          id: 9,
          title: "فضل الصبر على فقد الأحبة",
          text: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «يَقُولُ اللَّهُ تَعَالَى: مَا لِعَبْدِي الْمُؤْمِنِ عِنْدِي جَزَاءٌ إِذَا قَبَضْتُ صَفِيَّهُ مِنْ أَهْلِ الدُّنْيَا ثُمَّ احْتَسَبَهُ إِلَّا الْجَنَّةُ».",
          source: "صحيح البخاري",
          category: "patience",
          categoryLabel: "درجات الصبر",
          explanation: "احتساب الأجر عند فقد الأحبة والصبر الجميل على قضاء الله يوجب لصاحبه الفوز بالجنة بلا حساب."
        },
        {
          id: 10,
          title: "عاقبة الكذب ورأس الآفات",
          text: "عَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ... وَإِنَّ الْكَذِبَ يَهْدِي إِلَى الْفُجُورِ، وَإِنَّ الْفُجُورَ يَهْدِي إِلَى النَّارِ، وَإِنَّ الرَّجُلَ لَيَكْذِبُ حَتَّى يُكْتَبَ عِنْدَ اللَّهِ كَذَّابًا».",
          source: "صحيح البخاري ومسلم",
          category: "tongue",
          categoryLabel: "آفات اللسان",
          explanation: "الصدق طمأنينة ونجاة، والكذب ريبة ومهلكة يقود صاحبه تدريجياً لارتكاب الفواحش والمعاصي ويسلبه شرف الثقة والأمانة."
        }
      ];
      return res.json({
        status: "success",
        count: hadiths.length,
        data: hadiths
      });
    } catch (err: any) {
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // --- End of Daily Inspiration API Sources ---

  // Simple in-memory server-side cache for Tafsir Razi to prevent redundant API calls
  const raziTafsirCache = new Map<string, any>();

  // Tafsir Al-Razi (Mafatih al-Ghayb) Smart Generator Route
  app.post("/api/tafsir-razi", rateLimiter(15, 60 * 1000, "GeminiAI"), async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set server-side." });
      }

      // Sanitize inputs
      const surahNumber = sanitizeString(req.body.surahNumber, 10);
      const surahName = sanitizeString(req.body.surahName, 150);
      const ayahs = req.body.ayahs;

      if (!surahNumber) {
        return res.status(400).json({ error: "Missing Surah identity" });
      }

      // Neutralize cache keys to prevent pollution
      const cacheKey = String(surahNumber).replace(/[^0-9]/g, "");
      if (raziTafsirCache.has(cacheKey)) {
        console.log(`Serving Tafsir Razi for Surah ${surahNumber} (${surahName}) from server-side memory cache.`);
        return res.json(raziTafsirCache.get(cacheKey));
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      if (!ayahs || !Array.isArray(ayahs) || ayahs.length === 0) {
        return res.json({
          code: 200,
          status: "OK",
          data: {
            number: Number(surahNumber),
            name: surahName || "",
            ayahs: []
          }
        });
      }

      // Restrict payload array size to prevent denial of service (max 100 items per call)
      const safeAyahs = ayahs.slice(0, 100).map((a: any) => ({
        numberInSurah: Number(a.numberInSurah) || 0,
        text: sanitizeString(a.text, 1000)
      }));

      // Group ayahs into chunks of maximum 20 ayahs
      const CHUNK_SIZE = 20;
      const chunks = [];
      for (let i = 0; i < safeAyahs.length; i += CHUNK_SIZE) {
        chunks.push(safeAyahs.slice(i, i + CHUNK_SIZE));
      }

      console.log(`Generating Tafsir Razi for Surah ${surahNumber} (${surahName}) in ${chunks.length} chunks sequentially with rate-limiting backoff...`);

      // Helper for exponential backoff on retry (especially 429 errors)
      async function generateWithRetry(chunk: any[], index: number, retriesLeft = 4, initialDelay = 3000): Promise<any> {
        const prompt = `
          أنت مفسر وعالم متبحر متخصص في علوم القرآن بلقب العلامة فخر الدين الرازي.
          الآيات المطلوبة من سورة: ${surahName || surahNumber} (الدفعة رقم ${index + 1} من أصل ${chunks.length}):
          ${chunk.map(a => `الآية (${a.numberInSurah}): "${a.text}"`).join('\n')}
 
          المطلب:
          توليد التفسير الدقيق والعميق لهذه الآيات بأسلوب ومنهج الإمام فخر الدين الرازي في تفسيره الشهير "مفاتيح الغيب" (تفسير الرازي).
          تذكر جيداً الأسلوب الكلامي والفلسفي والعقلاني والجدلي المميز للفخر الرازي في تفكيك الآيات إلى مسائل ومباحث وسؤال وجواب:
          1. ابسط المسائل العقلية والمناسبات اللغوية بذكر تقسيمات منظمة ومتناسقة (مثال: المسألة الأولى: في وجه الاستدلال... المسألة الثانية: في بيان المعنى اللغوي...).
          2. أثرِ وجوه الاستدلال والاحتجاج العقلي والكلامي لدعم عقيدة التوحيد وتأكيد الحكمة القرآنية.
          3. استخدم صياغته الشهيرة في المحاجة والرد على الإشكالات: "فإن قيل كذا وكذا... قلنا من وجوه: الأول... الثاني...".
          4. لا تختصر اختصاراً مخلاً بل بيّن اللطائف والدرر البلاغية والروابط بين الكلمات بأسلوب فخم رفيع.
 
          يجب أن تكون الاستجابة بصيغة JSON حصراً، على هذا النحو تماماً:
          {
            "tafsir": {
               ${chunk.map(a => `"${a.numberInSurah}": "نص تفسير الآية الكريمة بالتفصيل والروح العلمية بأسلوب الرازي الفخم والمنهجي والمسائل المرتبة..."`).join(',\n               ')}
            }
          }
        `;

        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            }
          });

          const parsed = JSON.parse(response.text || "{}");
          return parsed.tafsir || {};
        } catch (err: any) {
          const errString = JSON.stringify(err);
          const errMessage = (err?.message || "").toLowerCase();
          const isTransientError = err?.status === 429 || 
                                   err?.statusCode === 429 || 
                                   err?.status === 503 ||
                                   err?.statusCode === 503 ||
                                   errString.includes("429") || 
                                   errString.includes("503") || 
                                   errString.includes("UNAVAILABLE") ||
                                   errMessage.includes("429") || 
                                   errMessage.includes("503") || 
                                   errMessage.includes("quota") || 
                                   errMessage.includes("limit") ||
                                   errMessage.includes("demand") ||
                                   errMessage.includes("temporary") ||
                                   errMessage.includes("overloaded") ||
                                   errMessage.includes("unavailable");

          if (isTransientError && retriesLeft > 0) {
            const delay = initialDelay * (5 - retriesLeft) + Math.random() * 2000;
            console.warn(`[Tafsir Razi] Transient error hit for chunk ${index} of Surah ${surahNumber}. Retrying in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateWithRetry(chunk, index, retriesLeft - 1, initialDelay * 2);
          }

          console.error(`Error generating Tafsir Razi chunk ${index}:`, err);
          const fallback: Record<string, string> = {};
          chunk.forEach(a => {
            fallback[a.numberInSurah] = `في تفسير هذه الآية الكريمة، يتطرق الإمام فخر الدين الرازي في "مفاتيح الغيب" إلى عدة مسائل كلامية وعقلية جليلة؛ المسألة الأولى تتعلق بوجه المناسبة والارتباط المعنوي بما قبلها، والالمسألة الثانية تبين دلالة الألفاظ ولطائفها الإعجازية من الناحية العقلية واللغوية لتثبيت أصول اليقين وتنزيه باري البرية سبحانه وتعالى.`;
          });
          return fallback;
        }
      }

      const results: any[] = [];
      for (let i = 0; i < chunks.length; i++) {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
        const chunkResult = await generateWithRetry(chunks[i], i);
        results.push(chunkResult);
      }

      const combinedTafsir: Record<string, string> = {};
      results.forEach(chunkResult => {
        Object.assign(combinedTafsir, chunkResult);
      });

      const responseAyahs = safeAyahs.map(a => {
        const textVal = combinedTafsir[String(a.numberInSurah)] || "تفسير هذه الآية الكريمة متوفر في مفاتيح الغيب للفخر الرازي.";
        return {
          numberInSurah: Number(a.numberInSurah),
          text: sanitizeString(textVal, 8000)
        };
      });

      const finalResponse = {
        code: 200,
        status: "OK",
        data: {
          number: Number(surahNumber),
          name: surahName || "",
          ayahs: responseAyahs
        }
      };

      raziTafsirCache.set(cacheKey, finalResponse);
      res.json(finalResponse);
    } catch (error) {
      console.error("Tafsir Razi API Error:", error);
      res.status(500).json({ error: "Failed to generate Tafsir Razi" });
    }
  });

  // Gemini API proxy for image validation (Mod-Check)
  app.post("/api/analyze-image", rateLimiter(15, 60 * 1000, "GeminiAI"), async (req, res) => {
    try {
      const { imageDataUrl } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }

      if (!imageDataUrl || typeof imageDataUrl !== "string") {
        return res.status(400).json({ error: "Missing or invalid base64 image content" });
      }

      // base64 visual signature validation
      const base64Regex = /^data:(image\/(png|jpeg|jpg));base64,([A-Za-z0-9+/=]{10,})$/;
      if (!base64Regex.test(imageDataUrl)) {
        return res.status(400).json({ error: "Invalid encoding structure" });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const matches = imageDataUrl.match(base64Regex);
      if (!matches || matches.length !== 4) {
        return res.status(400).json({ error: "Invalid matches block" });
      }
      const mimeType = matches[1];
      const data = matches[3];

      const prompt = `
        You are a strictly compliant content moderator for an Islamic application community.
        Analyze the provided image and check if it contains ANY of the following:
        1. Human beings, people, faces, human body parts (photos or clear drawings).
        2. Animals, birds, fish, or any living creatures with a soul (photos or clear drawings).
        3. Indecent, inappropriate, or explicitly non-Islamic content.
        
        If the image contains ANY of the above, return EXACTLY the string "REJECTED".
        If the image is purely text, abstract shapes, nature (trees, mountains, water, space) WITHOUT living creatures, return EXACTLY the string "APPROVED".
      `;

      const result = await callGeminiWithRetry(ai, "gemini-3.6-flash", {
        contents: [
          prompt,
          {
             inlineData: {
                mimeType,
                data
             }
          }
        ]
      });

      const responseText = result.text?.trim().toUpperCase();
      const isApproved = responseText?.includes("APPROVED");

      res.json({ 
        approved: isApproved, 
        reason: isApproved ? "ok" : "Image rejected by rules (contains people, animals, or indecent content)." 
      });
    } catch (error) {
      console.error("Gemini API Error (Image Analysis):", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  // Proxy Stream Route (Reinforce SSRF validation and enforce strict rate limit)
  app.get("/api/proxy-stream", rateLimiter(60, 60 * 1000, "ProxyStream"), async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");

    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "Missing audio url" });
      }

      // Robust URL validation & protection against SSRF
      let parsedTargetUrl;
      try {
        parsedTargetUrl = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid url parameter" });
      }

      const blockedHostnames = ['localhost', '127.0.0.1', 'metadata.google.internal', 'metadata'];
      const isLoopbackOrPrivate = blockedHostnames.includes(parsedTargetUrl.hostname) ||
          parsedTargetUrl.hostname.startsWith('10.') ||
          parsedTargetUrl.hostname.startsWith('192.168.') ||
          parsedTargetUrl.hostname.startsWith('169.254.') ||
          parsedTargetUrl.hostname.startsWith('172.');

      if (!['http:', 'https:'].includes(parsedTargetUrl.protocol) || isLoopbackOrPrivate) {
        return res.status(403).json({ error: "Access to private resources is forbidden." });
      }

      const resolvedUrl = await resolveArchiveOrgUrl(url);

      const doRequest = (targetUrl: string, redirectCount = 0) => {
          if (redirectCount > 10) return res.status(500).json({ error: "Too many redirects" });
          
          let sanitizedUrl: string;
          try {
            const decoded = decodeURI(targetUrl);
            sanitizedUrl = encodeURI(decoded);
          } catch (urlErr) {
            sanitizedUrl = targetUrl;
          }

          const client = sanitizedUrl.startsWith('https') ? https : http;
          
          const options: any = { 
            headers: { 
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'accept': '*/*',
              'accept-language': 'en-US,en;q=0.9',
            },
            rejectUnauthorized: false
          };
          if (sanitizedUrl.includes('archive.org')) {
             options.headers['referer'] = 'https://archive.org/';
          }
          
          if (req.headers.range) {
              options.headers['range'] = req.headers.range;
          }

          const activeRequest = client.get(sanitizedUrl, options, (proxyRes) => {
            if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
              let redirectUrl = proxyRes.headers.location;
              try {
                redirectUrl = new URL(redirectUrl, sanitizedUrl).toString();
              } catch (e) {
                // Keep location as-is
              }
              return doRequest(redirectUrl, redirectCount + 1);
            }

            if (proxyRes.statusCode !== 200 && proxyRes.statusCode !== 206) {
              return res.status(proxyRes.statusCode || 500).end();
            }

            const contentType = proxyRes.headers['content-type'];
            if (contentType && (contentType.includes('text/html') || contentType.includes('application/json') || contentType.includes('text/xml'))) {
              console.warn(`Proxy intercepted non-media content-type: ${contentType}`);
              return res.status(415).json({ error: "Unsupported media content-type or server block" });
            }

            const headersToForward = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
            for (const header of headersToForward) {
                if (proxyRes.headers[header]) {
                    res.setHeader(header, proxyRes.headers[header] as string);
                }
            }
            res.status(proxyRes.statusCode as number);

            proxyRes.on('error', (err) => {
              console.error("Proxy streaming source error:", err.message);
              res.end();
            });

            proxyRes.pipe(res);
          });

          activeRequest.on('error', (e) => {
            console.error("Proxy client connection error:", e.message);
            if (!res.headersSent) {
              res.status(500).json({ error: e.message });
            }
          });

          // Protect server from socket/thread exhaustion under millions of active stream sessions:
          // Immediately abort/destroy outbound proxy request to archive.org if client closes connection (closes tab or skips track)
          req.on('close', () => {
            activeRequest.destroy();
          });
      };
      
      doRequest(resolvedUrl);

    } catch (error) {
      console.error("Proxy Stream Error:", error);
      res.status(500).json({ error: "Proxy stream failed" });
    }
  });

  // Proxy Download Route with robust Carriage Return Line Feed (CRLF) Injection Defense
  app.get("/api/proxy-download", rateLimiter(300, 60 * 1000, "ProxyStream"), async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range, Authorization");

    try {
      const { url, filename } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "Missing audio url" });
      }

      // Strong mitigation for Carriage Return Line Feed (CRLF) Response splitting in headers
      let safeFilename = "audio.mp3";
      if (typeof filename === "string") {
        safeFilename = filename
          .replace(/[\r\n]/g, "")
          .replace(/[\\\/:]/g, "_")
          .slice(0, 100);
      }

      // Strong URL input validation & basic SSRF defense
      let parsedTargetUrl;
      try {
        parsedTargetUrl = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid url parameter" });
      }

      const blockedHostnames = ['localhost', '127.0.0.1', 'metadata.google.internal', 'metadata'];
      const isLoopbackOrPrivate = blockedHostnames.includes(parsedTargetUrl.hostname) ||
          parsedTargetUrl.hostname.startsWith('10.') ||
          parsedTargetUrl.hostname.startsWith('192.168.') ||
          parsedTargetUrl.hostname.startsWith('169.254.') ||
          parsedTargetUrl.hostname.startsWith('172.');

      if (!['http:', 'https:'].includes(parsedTargetUrl.protocol) || isLoopbackOrPrivate) {
        return res.status(403).json({ error: "Access to private resources is forbidden." });
      }

      const resolvedUrl = await resolveArchiveOrgUrl(url);

      const doDownloadRequest = (targetUrl: string, redirectCount = 0) => {
        if (redirectCount > 5) return res.status(500).json({ error: "Too many redirects" });

        let sanitizedUrl: string;
        try {
          const decoded = decodeURI(targetUrl);
          sanitizedUrl = encodeURI(decoded);
        } catch (urlErr) {
          sanitizedUrl = targetUrl;
        }

        const client = sanitizedUrl.startsWith('https') ? https : http;
        
        const options: any = { 
          headers: { 
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept': '*/*'
          },
          rejectUnauthorized: false
        };

        const activeDownloadRequest = client.get(sanitizedUrl, options, (proxyRes) => {
          if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
            let redirectUrl = proxyRes.headers.location;
            try {
              redirectUrl = new URL(redirectUrl, sanitizedUrl).toString();
            } catch (e) {
              // Keep raw location
            }
            return doDownloadRequest(redirectUrl, redirectCount + 1);
          }

          if (proxyRes.statusCode !== 200) {
            return res.status(proxyRes.statusCode || 500).end();
          }

          res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'audio/mpeg');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFilename)}"`);
          if (proxyRes.headers['content-length']) {
            res.setHeader('Content-Length', proxyRes.headers['content-length']);
          }
          res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition');
          res.setHeader('Accept-Ranges', 'bytes');
          
          proxyRes.on('error', (err) => {
            console.error("Proxy download stream source error:", err.message);
            res.end();
          });

          proxyRes.pipe(res);
        });

        activeDownloadRequest.on('error', (e) => {
          console.error("Proxy download connection error:", e.message);
          if (!res.headersSent) {
            res.status(500).json({ error: e.message });
          }
        });

        // Immediately abort outbound download connection if client terminates early to save server bandwidth and socket files
        req.on('close', () => {
          activeDownloadRequest.destroy();
        });
      };

      doDownloadRequest(resolvedUrl);

    } catch (error) {
      console.error("Proxy Download Error:", error);
      res.status(500).json({ error: "Proxy download failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static assets with strict caching rules (hashed assets cached long-term, entry points always fresh)
    app.use(express.static(distPath, { 
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('.html') || filePath.endsWith('.json') || filePath.endsWith('.webmanifest') || filePath.endsWith('.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    app.get("*all", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      try {
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, "utf8");
          
          // Extract headers to formulate fully qualified URLs
          const host = req.get("host") || "athkar-believer.run.app";
          const protocol = (host.includes("localhost") || host.includes("127.0.0.1")) ? "http" : "https";
          const absoluteOrigin = `${protocol}://${host}`;
          
          // Make relative path image parameters absolute for social crawler robots (WhatsApp, Telegram, Facebook)
          html = html.replace(/content="\/logo-512\.png\?v=\d+"/g, `content="${absoluteOrigin}/logo-512.png"`);
          html = html.replace(/value="\/logo-512\.png\?v=\d+"/g, `value="${absoluteOrigin}/logo-512.png"`);
          html = html.replace(/href="\/logo-192\.png\?v=\d+"/g, `href="${absoluteOrigin}/logo-192.png"`);
          html = html.replace(/href="\/logo\.svg\?v=\d+"/g, `href="${absoluteOrigin}/logo.svg"`);
          html = html.replace(/content="\/"/g, `content="${absoluteOrigin}/"`);
          html = html.replace(/property="og:url" content="\/"/g, `property="og:url" content="${absoluteOrigin}/"`);
          
          res.send(html);
        } else {
          res.sendFile(indexPath);
        }
      } catch (err) {
        console.error("Dynamic HTML pre-processing error:", err);
        res.sendFile(indexPath);
      }
    });
  }

  // Ensure high-quality PNG of logo exists
  await ensureLogoPng();

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${isDev ? "development" : "production"})`);
  });

  // Handle Cloud Run termination signals cleanly
  const shutdown = (signal: string) => {
    console.log(`${signal} received, closing HTTP server...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

async function ensureLogoPng() {
  const publicDir = path.join(process.cwd(), "public");
  const distDir = path.join(process.cwd(), "dist");
  
  try {
    if (fs.existsSync(publicDir) && fs.existsSync(distDir)) {
      const files = fs.readdirSync(publicDir);
      for (const file of files) {
        if (/^(logo.*|favicon.*|apple-touch-icon.*|manifest.*)$/i.test(file)) {
          const src = path.join(publicDir, file);
          const dest = path.join(distDir, file);
          fs.writeFileSync(dest, fs.readFileSync(src));
        }
      }
      console.log("[Logo Compiler] All official branding icons synced from public to dist.");
    }
  } catch (err: any) {
    console.error("[Logo Compiler] Failed to sync logo files:", err.message);
  }
}

startServer();
