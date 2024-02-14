import express from "express";
import bodyParser from "body-parser";
import {jsPDF} from 'jspdf'
import { format } from 'date-fns'
import cors from 'cors'
import axios from 'axios'

const PORT = 4000;
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors())

const date = new Date()
let blobFile = null

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
  const imgData = req.body?.imgData;
  const password = req.body?.password;
  const mstSeq = req.body?.mstSeq;
  
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    encryption: {
      userPassword: password,
      ownerPassword: password,
      userPermissions: ['print', 'modify', 'copy', 'annot-forms'],
    },
  });
  let imgWidth = 210;
  let pageHeight = 295
  let imgHeight = height
  let heightLeft = imgHeight
  let position = 0

  doc?.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight
  while (heightLeft >= 20) {
    position = heightLeft - imgHeight
    doc?.addPage()
    doc?.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  const file = doc?.output('blob')
  let data = new File([file], `best_${format(date, 'yyyyMMddHHmmss')}.pdf`, { type: 'application/pdf' })
  blobFile = data
  
  handleUploadFile(password, mstSeq)
  res.send('success')
  });
const handleListening = () => {
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);
}

app.listen(PORT, handleListening);