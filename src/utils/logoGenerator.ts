// Utility for generating official branding card for Athkar Al-Mumin App containing official logo & website URL

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

export const OFFICIAL_APP_URL = 'https://azkaralmumin.netlify.app';

export const generateOfficialLogoCard = async (
  logoUrl: string = '/logo-512.png',
  appTitle: string = 'تطبيق أذكار المؤمن',
  appSubtitle: string = 'التطبيق الإسلامي الشامل — القرآن الكريم والأذكار ومواقيت الصلاة',
  websiteUrl: string = OFFICIAL_APP_URL
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    // High resolution canvas (1200 x 1200 px)
    canvas.width = 1200;
    canvas.height = 1200;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoUrl;

    img.onload = () => {
      // 1. Background Gradient (Dark Emerald)
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1200);
      bgGrad.addColorStop(0, '#032117');
      bgGrad.addColorStop(0.5, '#073a28');
      bgGrad.addColorStop(1, '#01140b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 1200);

      // 2. Decorative Outer Metallic Borders
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 10;
      ctx.strokeRect(36, 36, 1128, 1128);

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, 1104, 1104);

      // Corner Accents (Gold)
      const drawCornerAccent = (cx: number, cy: number, rot: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.lineTo(0, 0);
        ctx.lineTo(50, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCornerAccent(64, 64, 0);
      drawCornerAccent(1136, 64, Math.PI / 2);
      drawCornerAccent(1136, 1136, Math.PI);
      drawCornerAccent(64, 1136, -Math.PI / 2);

      // 3. Top Official Badge Text
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦ الهوية الرسمية المعتمدة ✦', 600, 115);

      // 4. Draw Logo Container with Soft Glow & Border
      const logoSize = 340;
      const logoX = (1200 - logoSize) / 2;
      const logoY = 165;

      ctx.save();
      ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
      ctx.shadowBlur = 50;
      ctx.fillStyle = '#064e3b';
      drawRoundRect(ctx, logoX - 20, logoY - 20, logoSize + 40, logoSize + 40, 56);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // Clip and draw image
      ctx.save();
      drawRoundRect(ctx, logoX, logoY, logoSize, logoSize, 44);
      ctx.clip();
      ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      // 5. App Title & Description
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'black 64px "El Messiri", "Amiri", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 12;
      ctx.fillText(appTitle, 600, 615);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 28px sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText(appSubtitle, 600, 675);

      // Gold Ornamental Divider
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(350, 720);
      ctx.lineTo(850, 720);
      ctx.stroke();

      // Center Diamond
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(600, 720, 8, 0, Math.PI * 2);
      ctx.fill();

      // 6. Website URL Highlight Box
      const boxW = 860;
      const boxH = 120;
      const boxX = (1200 - boxW) / 2;
      const boxY = 770;

      ctx.save();
      ctx.fillStyle = '#022c22';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 25;
      drawRoundRect(ctx, boxX, boxY, boxW, boxH, 32);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Link Label
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('رابط الموقع الإلكتروني الرسمي للتطبيق:', 600, boxY + 38);

      // Link URL (Big & Gold)
      ctx.fillStyle = '#fef08a';
      ctx.font = 'black 38px sans-serif';
      ctx.fillText(websiteUrl, 600, boxY + 88);

      // 7. Footer / Copyright & Verification
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('✓ شعار رسمي موثق لخادم الأذكار والقرآن الكريم', 600, 1025);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '22px sans-serif';
      ctx.fillText('جميع الحقوق محفوظة © ' + appTitle + ' 2026', 600, 1075);

      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };

    img.onerror = () => {
      // Fallback if logo fails to load
      reject(new Error('Failed to load logo image for card generation'));
    };
  });
};
