const axios = require('axios')
const formData = require('form-data')

const handleUploadFile = async (pdf, password, mstSeq, name) => {
  let file = new File([pdf], `${name}.pdf`, { type: 'application/pdf' })
  const formData = new FormData()
  if (file) {
    formData.append('file', file)
    formData.append('filePassword', password)
  }
  try {
    const response = await axios.post(
      `https://dev-api.ggi.co.kr:8443/ggi/api/bid-form/${mstSeq}/upload`,
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

module.exports = { handleUploadFile };