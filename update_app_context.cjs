const fs = require('fs');
let content = fs.readFileSync('src/AppContext.tsx', 'utf8');

content = content.replace(
  `        const isUpgradingToV23 = !safeLocalStorageGetItem('believer_settings_v23_upgraded');`,
  `        const isUpgradingToV24 = !safeLocalStorageGetItem('believer_settings_v24_upgraded');\n        if (isUpgradingToV24) {\n          merged.notificationsEnabled = true;\n          merged.morningNotificationsEnabled = true;\n          merged.eveningNotificationsEnabled = true;\n          merged.prayerNotificationsEnabled = true;\n          merged.sunnahReminderEnabled = true;\n          merged.randomAdhkarEnabled = true;\n          merged.prayerNotificationSettings = { Fajr: true, Sunrise: false, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };\n          safeLocalStorageSetItem('believer_settings_v24_upgraded', 'true');\n        }\n\n        const isUpgradingToV23 = !safeLocalStorageGetItem('believer_settings_v23_upgraded');`
);

fs.writeFileSync('src/AppContext.tsx', content, 'utf8');
