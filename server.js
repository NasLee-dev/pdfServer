const express = require("express");
const path = require("path");
const fs = require("fs");
const options = {
  key: fs.readFileSync('./example.com+4-key.pem'),
  cert: fs.readFileSync('./example.com+4.pem')
}
const {
  generatePdf,
} = require("./src/pdfCreate");
const cors = require("cors");
const app = express();
const port = 8000;
app.use(express.urlencoded({ extended: false, limit: "100mb" }));
app.use(express.json({ limit: "100mb" }));
app.use("/logo", express.static("./src/logo.png")); // src 폴더에 꼭 로고 파일 넣어주기 .
app.use(express.static('dist'));
app.use(
  cors({
    origin: "*", // 모든 출처 허용 옵션. true 를 써도 된다. // 배포 시 제거 요망
  })
);
const server = require('https').createServer(options, app);

app.post("/download/", (req, res) => {
  const html = req.body.html;
  const name = req.body.name;
  const password = req.body.password;
  const mstSeq = req.body.mstSeq;
  const pageNum = req.body.pageNum;  
  const userIdYn = req.body.userIdYn;

  const pdf = generatePdf(html, name, password, mstSeq, pageNum, userIdYn);

  pdf.then((data) => {
    res.send(data);
  });
});

server.listen(port, () => {
  console.log('Listening...')
});