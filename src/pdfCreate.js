const fs = require("fs");
const utils = require("util");
const puppeteer = require("puppeteer");
const hb = require("handlebars");
const jsPdf = require("jspdf");

const { handleUploadFile } = require("./sendPdf");

const readFile = utils.promisify(fs.readFile);
async function generatePdf(htmlContents, name, pw, mstSeq, pageNum, userIdYn) {
  let data = {};
  console.log("Compiing the template with handlebars");
  const contentWrapperStart = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Batang&display=swap" rel="stylesheet">
    </head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {
          fontFamily: {
            nanum: ['NanumGothic', 'sans-serif'],
            batang: ['Batang', 'serif'],
          },
          backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            'gradient-conic':
              'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
          },
        },
        colors: {
          white: colors.white,
          black: colors.black,
          gray: colors.gray,
          blue: colors.blue,
          red: colors.red,
          yellow: colors.yellow,
          green: colors.green,
          indigo: colors.indigo,
          purple: colors.purple,
          pink: colors.pink,
          teal: colors.teal,
          orange: colors.orange,
          cyan: colors.cyan,
          lime: colors.lime,
          emerald: colors.emerald,
          rose: colors.rose,
          fuchsia: colors.fuchsia,
          violet: colors.violet,
          amber: colors.amber,
          sky: colors.sky,
          mygray: '#8D8D8D',
          mybg: '#F6F6F6',
          myborder: '#E0E0E0',
          mygold: '#C89C23',
          mygraybg: '#D1D1D1',
          myyellow: '#D3AB3B',
          myRed: '#FF0000',
          myBlue: '#4a81a4'
        }
      },
      plugins: [require("tailwind-scrollbar-hide")],
    }
  </script>
  <body>
    <div class="flex flex-col bg-white h-[100%] w-[100%] mx-auto relative justify-center items-center">
  `; // 건드리면 안 됨
    const contentWrapperEnd = `</div></body></html>`;
    // 건드리면 안 됨
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const doc = new jsPdf.jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      encryption: {
        userPassword: pw, // 비밀번호 설정
        ownerPassword: pw, // 비밀번호 설정
        userPermissions: ["print", "modify", "copy", "annot-forms"],
      },
    });
  const template = hb.compile(contentWrapperStart + htmlContents + contentWrapperEnd, {
    strict: true,
  });
  const result = template(data);
  const html = result;
  await page.setContent(html);
  await page.setViewport({ width: 1000, height: 1300 }); // 건드리면 안 됨

  const imgData = await page.screenshot({ fullPage: true });
  let imgWidth = 210; // 건드리면 안 됨
  let pageHeight = 290; // 건드리면 안 됨
  let imgHeight = pageHeight * pageNum; // pageNum는 페이지 장수를 뜻함
  let heightLeft = imgHeight;
  let position = 0;

  doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft >= 20) {
    position = heightLeft - imgHeight + 20; // 미세조정  필요
    doc.addPage();
    doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  doc.save(`${name}.pdf`);

  if (userIdYn === "Y") {
    let pdf = fs.readFileSync(`${name}.pdf`);
    fs.rmSync(`${name}.pdf`);
    await handleUploadFile(pdf, pw, mstSeq, name);
    await browser.close();
    console.log("PDF Generated!!!");
    return pdf;
  } else {
    let pdf = fs.readFileSync(`${name}.pdf`);
    fs.rmSync(`${name}.pdf`);
    console.log("PDF Generated!!");
    return pdf;
  }
}
module.exports = { generatePdf };
