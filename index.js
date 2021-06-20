// 儲存 client 端的 sub 值，發送推撥通知的時候需要 sub 值才能發送給 client
const fs = require('fs');
const readFile = () => {
  var data = fs.readFileSync("./json/clientSubs.json").toString();
  return JSON.parse(data);
}
const writeFile = (data) => {
  fs.writeFileSync("./json/clientSubs.json", JSON.stringify(data, null, "\t"));
}

// 使用指令: web-push generate-vapid-keys 可以產生新的 private Key 和 public Key
const webpush = require('web-push');
const vapidKeys = {
  publicKey: 'BPz4WOY59_ZR8exvjS08Y6ICcVOduUF8W48e6v9k0F2pUs7uxWgAyV8ntk6LB5EEF8iFPqTAYHPy5szLibGK1ic',
  privateKey: '_QJcl6YAW63hWnc_51HNk93_ea-mJ8XNFTCOEAgVquU',
};
webpush.setVapidDetails('mailto:tooto1985@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

// 底下為 express 後端處理
const express = require('express');
const path = require('path');
const { send } = require('process');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.post('/add', express.json(), (req, res) => {
  const clientSubs = readFile();
  clientSubs.push(req.body);
  writeFile(clientSubs);
  res.end();
});
app.get('/push', (req, res) => {
  const result = { success: 0, faile: 0 };
  const clientSubs = readFile();
  let i = 0;
  const sendOverCheck = () => {
    i--;
    if (i === 0) {
      writeFile(clientSubs);
      res.json(result);
    }
  };
  const scheduled = clientSubs.filter(item => !item.statusCode);
  if (scheduled.length) {
    scheduled.forEach(clientSub => {
      const pushConfig = {
        endpoint: clientSub.endpoint,
        keys: {
          auth: clientSub.keys.auth,
          p256dh: clientSub.keys.p256dh,
        }
      };
      const sendData = {
        title: req.query.title || '新貼文',
        body: req.query.body || '有新增的貼文!!',
        key: req.query.key
      };
      i++;
      webpush.sendNotification(pushConfig, JSON.stringify(sendData)).then(() => {
        result.success++;
        sendOverCheck();
      }).catch(err => {
        clientSub.statusCode = err.statusCode;
        result.faile++;
        sendOverCheck();
      });
    });
  } else {
    res.json(result);
  }
});
app.listen(process.env.PORT || 3000);