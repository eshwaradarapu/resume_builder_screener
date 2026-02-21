const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
  const htmlPath = process.argv[2];
  const pdfPath = process.argv[3];

  const html = fs.readFileSync(htmlPath, "utf8");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },

  // ⭐ THIS IS THE IMPORTANT ONE
  scale: 0.96
});


  await browser.close();
})();
