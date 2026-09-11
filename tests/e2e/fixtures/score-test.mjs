// Quick score check: legit vs fraud resumes against the new model
import { File } from "buffer";

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

const cases = [
  {
    label: "🎯 VERIFIED MATCH — Full Stack Engineer at StartupXYZ (Matches On-Chain!)",
    resumeText: "Full Stack Engineer at StartupXYZ built customer dashboard with Next.js and React",
    claimedExp: "Full Stack Engineer at StartupXYZ — Built customer dashboard with Next.js",
  },
  {
    label: "✅ LEGIT (No match on-chain) — Software Engineer at Google 3 yrs",
    resumeText: "Software Engineer at Google from 2021 to 2024 worked on distributed systems and Kubernetes",
    claimedExp: "Software Engineer at Google for 3 years working on backend distributed systems and cloud infrastructure",
  },
  {
    label: "✅ LEGIT — Junior Dev at TCS 2 yrs",
    resumeText: "Junior Developer at TCS for 2 years building REST APIs with Java and PostgreSQL",
    claimedExp: "Junior Software Developer at TCS for 2 years building enterprise applications",
  },
  {
    label: "🚨 FRAUD — CTO at age 18 with 20 years experience",
    resumeText: "CTO at age 18 with 20 years of experience in blockchain and quantum computing managed 5000 people",
    claimedExp: "Chief Technology Officer managing 5000 engineers with 20 years experience since age 18",
  },
  {
    label: "🚨 FRAUD — CEO of multiple Fortune 500 companies",
    resumeText: "CEO of multiple Fortune 500 companies simultaneously earned 10 billion dollars founded 15 startups all acquired",
    claimedExp: "Serial CEO and founder managed multiple billion dollar companies with zero failures all acquired",
  },
];

const wallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

console.log("BlockCredAI — Model Scoring Test\n" + "=".repeat(50));
for (const c of cases) {
  const pdf = makePdf(c.resumeText);
  const form = new FormData();
  form.set("resume", new File([pdf], "resume.pdf", { type: "application/pdf" }));
  form.set("walletAddress", wallet);
  form.set("claimedExperience", c.claimedExp);

  const resp = await fetch("http://localhost:4000/api/scanResume", { method: "POST", body: form });
  const data = await resp.json();

  const pct = Math.round(data.fraudProbability * 100);
  const bar = "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5));
  console.log(`\n${c.label}`);
  console.log(`  Fraud: ${bar} ${pct}%`);
  console.log(`  ${data.explanation}`);
  console.log(`  On-Chain Jobs Found: ${data.onChainJobs?.length ?? 0}`);
  if (data.onChainJobs?.length) {
    data.onChainJobs.forEach(j => console.log(`    - Job #${j.jobId}: ${j.jobDetails} (Token #${j.tokenId})`));
  }
}
console.log("\n" + "=".repeat(50));
