import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../presentation_assets");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function createPdfBuffer(text) {
  const content = `BT /F1 12 Tf 50 750 Td (${text}) Tj ET`;
  const len = Buffer.byteLength(content, "latin1");
  const parts = [
    "%PDF-1.4\n",
    "1 0 obj<</Type /Catalog /Pages 2 0 R>>\nendobj\n",
    "2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n",
    "3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]"
      + " /Contents 4 0 R /Resources<</Font<</F1 5 0 R>>>>>>\nendobj\n",
    `4 0 obj<</Length ${len}>>\nstream\n${content}\nendstream\nendobj\n`,
    "5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n",
  ];
  const body = parts.join("");
  const bodyBuf = Buffer.from(body, "latin1");
  let off = 0;
  const offsets = parts.map(p => { const o = off; off += Buffer.byteLength(p, "latin1"); return o; });
  const xref =
    `xref\n0 7\n0000000000 65535 f \n` +
    offsets.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("") +
    `trailer<</Size 7/Root 1 0 R>>\nstartxref\n${off}\n%%EOF\n`;
  return Buffer.concat([bodyBuf, Buffer.from(xref, "latin1")]);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Home Dashboard
  await page.goto("http://localhost:3000");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, "01_homepage_dashboard.png"), fullPage: false });
  console.log("Captured 01_homepage_dashboard.png");

  // 2. Perform Scan
  const testPdf = path.join(outputDir, "sample_resume.pdf");
  fs.writeFileSync(testPdf, createPdfBuffer("Aditya Kumar Software Engineer 4 years experience at Google Kubernetes Docker"));

  await page.getByLabel("Target Wallet Address").fill("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  await page.getByLabel("Claimed Experience").fill("Senior Full Stack Developer with 4 years experience building scalable Web3 applications and cloud microservices.");
  const fileInput = page.locator('input[type="file"][accept="application/pdf"]');
  await fileInput.setInputFiles(testPdf);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, "02_resume_upload_form.png"), fullPage: false });
  console.log("Captured 02_resume_upload_form.png");

  await page.getByRole("button", { name: /Verify Candidate/i }).click();
  const resultOrError = page.locator('[role="status"], [role="alert"]');
  await resultOrError.first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, "03_ai_scan_result.png"), fullPage: false });
  console.log("Captured 03_ai_scan_result.png");

  await browser.close();
}

main().catch(err => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
