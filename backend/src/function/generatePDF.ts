import puppeteer from "puppeteer";
import { marked } from "marked";
import fs from "fs";

export async function markdownToPDF(mdPath: string, outputPath: string) {
  const markdown = fs.readFileSync(mdPath, "utf-8");

  const htmlContent = `
<html>
<head>
  <style>
    body {
      font-family: "Calibri", Arial, sans-serif;
      max-width: 800px;
      margin: auto;
      padding: 28px;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
    }

    /* NAME */
    h1 {
      font-size: 22px;
      margin-bottom: 2px;
    }

    /* CONTACT LINE */
    h1 + p {
      font-size: 11px;
      margin-bottom: 10px;
      color: #333;
    }

    /* SECTION HEADERS */
    h2 {
      font-size: 13px;
      margin-top: 14px;
      margin-bottom: 6px;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* SUBHEAD (Company | Stack) */
    h3 {
      font-size: 12px;
      margin: 6px 0 2px 0;
      display: flex;
      justify-content: space-between;
    }

    /* DATE ALIGN RIGHT */
    .right {
      float: right;
      color: #444;
    }

    p {
      margin: 2px 0;
    }

    ul {
      margin: 4px 0 8px 16px;
      padding: 0;
    }

    li {
      margin-bottom: 3px;
    }

    strong {
      font-weight: 600;
    }

    /* SKILLS INLINE FORMAT */
    .skills p {
      margin: 2px 0;
    }

    </style>
        </head>
        <body>
        ${marked(markdown)}
        </body>
    </html>
`;

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
}
