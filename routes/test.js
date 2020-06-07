var router = require('express').Router();

router.get("/", function (req, res) {
    res.send("test success")
})

module.exports = router;

// const https = require('https');
// const fs = require('fs');

// const options = {
//   pfx: fs.readFileSync('test/fixtures/test_cert.pfx'),
//   passphrase: '密码'
// };

// https.createServer(options, (req, res) => {
//   res.writeHead(200);
//   res.end('你好，世界\n');
// }).listen(8000);
