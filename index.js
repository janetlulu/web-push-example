const fs = require('fs');
const readFile = () => {
  var data = fs.readFileSync("./json/clientSubs.json").toString();
  return JSON.parse(data);
}
const writeFile = (data) => {
  fs.writeFileSync("./json/clientSubs.json", JSON.stringify(data, null, "\t"));
}

// ==================================================
// 使用指令: web-push generate-vapid-keys 取得 private Key 和 public Key
const webpush = require('web-push');
const serverKey = {
  publicKey: 'BPz4WOY59_ZR8exvjS08Y6ICcVOduUF8W48e6v9k0F2pUs7uxWgAyV8ntk6LB5EEF8iFPqTAYHPy5szLibGK1ic',
  privateKey: '_QJcl6YAW63hWnc_51HNk93_ea-mJ8XNFTCOEAgVquU',
};
webpush.setVapidDetails('mailto:tooto1985@gmail.com', serverKey.publicKey, serverKey.privateKey);
// ==================================================
const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.post('/add', express.json(), (req, res) => {
  const clientSubs = readFile();
  clientSubs.push(req.body);
  writeFile(clientSubs);
  res.end();
});
app.get('/list', (req, res) => {
  const clientSubs = readFile();
  res.json(clientSubs);
});
app.get('/push', (req, res) => {
  const clientSubs = readFile();
  clientSubs.forEach(clientSub => {
    const pushConfig = {
      endpoint: clientSub.endpoint,
      keys: {
        auth: clientSub.keys.auth,
        p256dh: clientSub.keys.p256dh,
      }
    };
    webpush.sendNotification(pushConfig, JSON.stringify({ title: req.query.title || '新貼文', body: req.query.body || '有新增的貼文!!' })).catch(function(err) {
      console.log(err);
    });
  })
  res.end();
});
app.listen(process.env.PORT || 3000);