import { test, expect, Page, Request, Response } from "@playwright/test";
import path from "path";
import fs from "fs";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal valid text-based PDF in memory */
function createTestPdf(text = "John Doe Software Engineer 5 years experience at Google"): Buffer {
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

/** Intercept and log all API calls from the page */
function attachNetworkLogger(page: Page) {
  const log: Array<{ method: string; url: string; status?: number; body?: string }> = [];

  page.on("request", (req: Request) => {
    if (req.url().includes("localhost:4000")) {
      console.log(`\n🌐 REQUEST  ${req.method()} ${req.url()}`);
      log.push({ method: req.method(), url: req.url() });
    }
  });

  page.on("response", async (res: Response) => {
    if (res.url().includes("localhost:4000")) {
      let body = "";
      try { body = await res.text(); } catch { body = "<unreadable>"; }
      console.log(`🌐 RESPONSE ${res.status()} ${res.url()}`);
      console.log(`   Body: ${body.slice(0, 500)}`);
      const entry = log.find(e => e.url === res.url() && e.status === undefined);
      if (entry) { entry.status = res.status(); entry.body = body; }
    }
  });

  return log;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("BlockCredAI – Chrome Automation", () => {

  test("Page loads and shows AI Resume Scanner", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BlockCredAI/i);
    await expect(page.getByText("AI Resume Scanner")).toBeVisible();
    await expect(page.getByText("Trustless Employment")).toBeVisible();
    console.log("✅ Page loaded successfully");
  });

  test("Full resume scan flow with PDF upload", async ({ page }) => {
    // Write test PDF to disk (Playwright uploads from disk)
    const pdfDir = path.join(__dirname, "fixtures");
    fs.mkdirSync(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, "test-resume.pdf");
    fs.writeFileSync(pdfPath, createTestPdf());
    console.log(`📄 Test PDF written to: ${pdfPath}`);

    const networkLog = attachNetworkLogger(page);

    await page.goto("/");

    // Fill wallet address
    await page.getByLabel("Target Wallet Address").fill(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );

    // Fill claimed experience
    await page.getByLabel("Claimed Experience").fill(
      "Software Engineer with 5 years of experience working at Google on distributed systems and blockchain technology."
    );

    // Upload the PDF via the hidden file input
    const fileInput = page.locator('input[type="file"][accept="application/pdf"]');
    await fileInput.setInputFiles(pdfPath);

    // Wait for filename to show in UI
    await expect(page.getByText("test-resume.pdf")).toBeVisible();
    console.log("📤 PDF selected in UI");

    // Submit
    await page.getByRole("button", { name: /Verify Candidate/i }).click();
    console.log("🚀 Form submitted — waiting for AI analysis...");

    // Wait for result or error (up to 30 seconds)
    const resultOrError = page.locator('[role="status"], [role="alert"]');
    await resultOrError.first().waitFor({ timeout: 30000 });

    // Check what appeared
    const analysisComplete = page.getByText("Analysis Complete");
    const errorMsg = page.locator('[role="alert"] p');

    if (await analysisComplete.isVisible()) {
      const fraud = await page.locator("text=/\\d+%/").first().textContent();
      console.log(`\n✅ SCAN SUCCESSFUL!`);
      console.log(`   Fraud Probability: ${fraud}`);

      const explanation = await page.locator(".bg-indigo-950\\/40 p.text-indigo-100\\/80").textContent();
      console.log(`   Explanation: ${explanation?.trim()}`);

      await expect(page.getByText("Fraud Probability")).toBeVisible();
      await expect(page.getByText("On-Chain Employment Records")).toBeVisible();
      await expect(page.getByText("StartupXYZ")).toBeVisible();
      console.log("✅ On-chain employment record verified in browser UI!");
    } else if (await errorMsg.isVisible()) {
      const msg = await errorMsg.textContent();
      console.log(`\n❌ ERROR SHOWN IN UI: "${msg}"`);
      throw new Error(`UI showed error: ${msg}`);
    }

    // Print network summary
    console.log("\n📊 Network Summary:");
    for (const entry of networkLog) {
      console.log(`   ${entry.method} ${entry.url} → ${entry.status ?? "pending"}`);
      if (entry.body) console.log(`   Response: ${entry.body.slice(0, 200)}`);
    }

    // Take screenshot
    await page.screenshot({ path: path.join(pdfDir, "result-screenshot.png"), fullPage: false });
    console.log(`📸 Screenshot saved to tests/e2e/fixtures/result-screenshot.png`);
  });

  test("Shows error for missing fields", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Verify Candidate/i }).click();
    await expect(page.getByText("Please fill in all fields.")).toBeVisible();
    console.log("✅ Validation error shown correctly");
  });

  test("Shows error for non-PDF file", async ({ page }) => {
    // Write a .txt file to disk
    const txtDir = path.join(__dirname, "fixtures");
    fs.mkdirSync(txtDir, { recursive: true });
    const txtPath = path.join(txtDir, "not-a-pdf.txt");
    fs.writeFileSync(txtPath, "This is not a PDF file");

    await page.goto("/");
    await page.getByLabel("Target Wallet Address").fill("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    await page.getByLabel("Claimed Experience").fill("5 years software engineering experience");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(txtPath);
    await page.getByRole("button", { name: /Verify Candidate/i }).click();
    await expect(page.getByText("Please upload a PDF resume.")).toBeVisible();
    console.log("✅ Non-PDF validation error shown correctly");
  });

  test("Employer submits verification record and verifies it on-chain", async ({ page }) => {
    await page.goto("/");

    // Employee wallet to register (Hardhat account #4)
    const testEmployee = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";
    const testJob = "Senior Blockchain Architect at Decentralized AI Labs";

    // Fill the Submit Employment Record form
    await page.locator("#sv-employee").fill(testEmployee);
    await page.locator("#sv-details").fill(testJob);
    await page.locator("#sv-start").fill("2023-01-01");
    await page.locator("#sv-end").fill("2024-06-01");

    // Click submit
    await page.getByRole("button", { name: /Submit Employment Record/i }).click();

    // Expect success message
    await expect(page.getByText("Record submitted on-chain!")).toBeVisible({ timeout: 15000 });
    console.log("✅ Employment record submitted to smart contract successfully!");

    // Now scan this candidate with the resume scanner
    const pdfPath = path.join(__dirname, "fixtures", "test-resume.pdf");
    await page.locator("#walletAddress").fill(testEmployee);
    await page.locator("#claimedExperience").fill("Senior Blockchain Architect at Decentralized AI Labs");
    const fileInput = page.locator('input[type="file"][accept="application/pdf"]');
    await fileInput.setInputFiles(pdfPath);

    await page.getByRole("button", { name: /Verify Candidate/i }).click();

    // Wait for analysis
    await expect(page.getByText("Analysis Complete")).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("paragraph").filter({ hasText: testJob }).first()).toBeVisible();
    console.log("✅ Newly submitted on-chain record successfully verified in scanner!");
  });
});
