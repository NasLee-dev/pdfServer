import express from "express";
import bodyParser from "body-parser";
import {jsPDF} from 'jspdf'
import { format } from 'date-fns'
import cors from 'cors'
import axios from 'axios'
import FormData from 'form-data'
import puppeteer from "puppeteer";
import fs from 'fs'
import { JSDOM } from 'jsdom'

const PORT = 4000;
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors())

const date = new Date()
let blobFile = null

const handleHtml = async (htmlElement) => {
  const htmlString = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body>
    ${htmlElement}
  </body>
  </html>
  `
  const dom = new JSDOM(htmlString)
  const document = dom.window.document
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(document.documentElement.outerHTML);
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
}

// const handleBrowser = async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(`file://${__dirname}/index.html`);
//   await page.screenshot({ path: 'screenshot.png' });
//   await browser.close();
// }

const handleUploadFile = async (password, mstSeq) => {
  const formData = new FormData()
  if (blobFile) {
    formData.append('file', blobFile)
  }
  formData.append('filePassword', password)
  try {
    const response = await axios.post(
      `http://118.217.180.254:8081/ggi/api/bid-form/${mstSeq}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    if (response.status === 200) {
      console.log(response)
      return
    }
  } catch (error) {
    console.log(error)
  }
}


app.post("/test", async function (req, res) {
  const height = req.body?.height;
  const password = req.body?.password;
  const mstSeq = req.body?.mstSeq;
  const htmlElement = req.body?.htmlElement;

  try {
    handleHtml(htmlElement)
    // await handleHtml(htmlElement)
    // const canvas = await html2canvas(htmlElement, { scale: 2 })
    // const imgData = canvas.toDataURL('image/png')
    // const doc = new jsPDF({
    //   orientation: 'p',
    //   unit: 'mm',
    //   format: 'a4',
    //   encryption: {
    //     userPassword: password,
    //     ownerPassword: password,
    //     userPermissions: ['print', 'modify', 'copy', 'annot-forms'],
    //   },
    // });
    // let imgWidth = 210;
    // let pageHeight = 295
    // let imgHeight = height
    // let heightLeft = imgHeight
    // let position = 0
  
    // doc?.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    // heightLeft -= pageHeight
    // while (heightLeft >= 20) {
    //   position = heightLeft - imgHeight
    //   doc?.addPage()
    //   doc?.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    //   heightLeft -= pageHeight
    // }
    // const file = doc?.output('blob')
    // let data = new File([file], `best_${format(date, 'yyyyMMddHHmmss')}.pdf`, { type: 'application/pdf' })
    // blobFile = data
  
    // let blobUrl = URL.createObjectURL(data)
    // await handleUploadFile(password, mstSeq)
    // res.send(blobUrl)
  } catch (error) {
    console.log(error)
  }
});

const handleListening = () => {
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);
}

app.listen(PORT, handleListening);