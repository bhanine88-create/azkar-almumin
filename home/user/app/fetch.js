const https = require('https');

https.get('https://archive.org/metadata/www.forsanhaq.com_8441/files', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    const files = json.result.filter(f => f.name.includes('.mp3'));
    files.forEach(f => {
      console.log(f.name);
    });
  });
});
