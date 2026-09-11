import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Minimal valid 1-page PDF
function makePdf(text) {
  const content = `BT /F1 12 Tf 50 750 Td (${text}) Tj ET`;
  const len = Buffer.byteLength(content, "latin1");
  const parts = [
    "%PDF-1.4\n",
    "1 0 obj<</Type /Catalog /Pages 2 0 R>>\nendobj\n",
    "2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n",
    "3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<</Font<</F1 5 0 R>>>>>>\nendobj\n",
    `4 0 obj<</Length ${len}>>\nstream\n${content}\nendstream\nendobj\n`,
    "5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n",
  ];
  const body = parts.join("");
  let off = 0;
  const offsets = parts.map(p => { const o = off; off += Buffer.byteLength(p, "latin1"); return o; });
  const xref = `xref\n0 7\n0000000000 65535 f \n` +
    offsets.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("") +
    `trailer<</Size 7/Root 1 0 R>>\nstartxref\n${off}\n%%EOF\n`;
  return Buffer.concat([Buffer.from(body, "latin1"), Buffer.from(xref, "latin1")]);
}

async function main() {
  console.log("==================================================");
  console.log("🚀 Launching Google Chrome in Automation Mode...");
  console.log("==================================================");

  // Generate test PDF fixture
  const fixturesDir = path.resolve(__dirname, "../tests/e2e/fixtures");
  fs.mkdirSync(fixturesDir, { recursive: true });
  const pdfPath = path.join(fixturesDir, "automation-resume.pdf");
  fs.writeFileSync(pdfPath, makePdf("Saurabh Kumar Senior Full Stack & Blockchain Engineer at StartupXYZ"));

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: 600, // Smooth human-like pacing so user can watch everything
    args: ["--start-maximized"],
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  // Monitor network calls
  page.on("request", (req) => {
    if (req.url().includes("localhost:4000")) {
      console.log(`\n🌐 [Chrome Network] REQUEST  --> ${req.method()} ${req.url()}`);
    }
  });
  page.on("response", async (res) => {
    if (res.url().includes("localhost:4000")) {
      let body = "";
      try { body = await res.text(); } catch {}
      console.log(`🌐 [Chrome Network] RESPONSE <-- ${res.status()} ${res.url()}`);
      if (body) console.log(`   Response Body: ${body.slice(0, 300)}`);
    }
  });

  console.log("\n[Step 1/5] Navigating to BlockCredAI web app (http://localhost:3000)...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const testWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const newCandidate = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  console.log("\n[Step 2/5] Employer Submitting a Verified Record to Smart Contract...");
  await page.locator("#sv-employee").fill(newCandidate);
  await page.waitForTimeout(600);
  await page.locator("#sv-details").fill("Senior Full Stack & Smart Contract Engineer at Web3 Innovations");
  await page.waitForTimeout(600);
  await page.locator("#sv-start").fill("2023-01-01");
  await page.waitForTimeout(400);
  await page.locator("#sv-end").fill("2024-12-31");
  await page.waitForTimeout(800);

  console.log("   Clicking 'Submit Employment Record' to write to blockchain...");
  await page.getByRole("button", { name: /Submit Employment Record/i }).click();

  // Wait for on-chain confirmation
  await page.getByText("Record submitted on-chain!").waitFor({ timeout: 20000 });
  console.log("   ✅ Transaction confirmed! Record minted on blockchain!");
  await page.waitForTimeout(2000);

  console.log("\n[Step 3/5] Scanning Candidate Resume with AI Model & Smart Contract...");
  await page.locator("#walletAddress").fill(newCandidate);
  await page.waitForTimeout(600);
  await page.locator("#claimedExperience").fill("Senior Full Stack & Smart Contract Engineer at Web3 Innovations");
  await page.waitForTimeout(600);

  console.log("   Uploading resume PDF...");
  const fileInput = page.locator('input[type="file"][accept="application/pdf"]');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(1000);

  console.log("   Clicking 'Verify Candidate'...");
  await page.getByRole("button", { name: /Verify Candidate/i }).click();

  console.log("   Waiting for AI fraud analysis and smart contract retrieval...");
  await page.getByText("Analysis Complete").waitFor({ timeout: 25000 });
  await page.waitForTimeout(2000);

  console.log("\n[Step 4/5] Reading Verified Results from UI:");
  const fraudText = await page.locator("text=/\\d+%/").first().textContent();
  console.log(`   🎯 Fraud Probability: ${fraudText}`);

  const onChainSection = page.getByText("On-Chain Employment Records");
  await onChainSection.waitFor();
  console.log("   ✅ On-Chain Employment Records loaded and rendered!");

  // Take screenshot of the complete analysis
  const screenshotPath = path.join(fixturesDir, "chrome-automation-success.png");
  await page.screenshot({ path: screenshotPath });
  console.log(`   📸 Full UI Screenshot saved to: ${screenshotPath}`);
  await page.waitForTimeout(2000);

  console.log("\n[Step 5/5] Opening Render Blueprint page in a new Chrome tab...");
  const renderTab = await context.newPage();
  await renderTab.goto("https://dashboard.render.com/blueprints", { timeout: 30000 }).catch(() => {
    console.log("   (Render tab opened — dashboard loading)");
  });
  console.log("   ✅ Render dashboard opened at https://dashboard.render.com/blueprints");

  console.log("\n==================================================");
  console.log("🎉 ALL AUTOMATION STEPS COMPLETED SUCCESSFULLY!");
  console.log("==================================================");

  // Keep browser open for a few moments so user can view
  await page.waitForTimeout(5000);
  await browser.close();
}

main().catch((err) => {
  console.error("❌ Automation error:", err);
  process.exit(1);
});
