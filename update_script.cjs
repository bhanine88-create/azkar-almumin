const fs = require('fs');
let content = fs.readFileSync('src/lib/autoUpdater.ts', 'utf8');

content = content.replace(
  `import { registerSW } from 'virtual:pwa-register';`,
  `import { Capacitor } from '@capacitor/core';\nimport { registerSW } from 'virtual:pwa-register';\n\nconst LIVE_APP_URL = 'https://ais-pre-6lmcwdbxwli4qmb6fr6hbn-194075133835.europe-west3.run.app';`
);

content = content.replace(
  `const res = await fetch(\`/api/app-version?t=\${Date.now()}\`, {`,
  `const isLocalAPK = typeof window !== 'undefined' && Capacitor.isNativePlatform() && (window.location.hostname === 'localhost' || window.location.protocol === 'file:');\n    let fetchUrl = \`/api/app-version?t=\${Date.now()}\`;\n    if (isLocalAPK) {\n       fetchUrl = \`\${LIVE_APP_URL}/api/app-version?t=\${Date.now()}\`;\n    }\n    const res = await fetch(fetchUrl, {`
);

content = content.replace(
  `const serverBuild = Number(data.buildTime) || 0;`,
  `const serverBuild = Number(data.buildTime) || 0;\n\n    if (isLocalAPK) {\n        return { hasUpdate: true, version: data.version, serverBuildTime: serverBuild };\n    }`
);

content = content.replace(
  `console.log('[AutoUpdater] Applying instant update...');`,
  `console.log('[AutoUpdater] Applying instant update...');\n\n  if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {\n    const isLocalAPK = window.location.hostname === 'localhost' || window.location.protocol === 'file:';\n    if (isLocalAPK) {\n        localStorage.setItem('use_live_update', 'true');\n        window.location.href = LIVE_APP_URL;\n        return;\n    }\n  }`
);

fs.writeFileSync('src/lib/autoUpdater.ts', content, 'utf8');
