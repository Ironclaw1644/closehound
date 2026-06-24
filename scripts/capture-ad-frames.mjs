// Drives the mock screener at localhost:3000 and captures crisp 1080×1920
// proof frames for the paid ad. Uses system Chrome via puppeteer-core.
//   node scripts/capture-ad-frames.mjs
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=2"],
  defaultViewport: { width: 540, height: 960, deviceScaleFactor: 2 },
});

try {
  const page = await browser.newPage();
  await page.goto(`${BASE}/screen`, { waitUntil: "networkidle2" });
  await page.evaluate(() => localStorage.setItem("ch_seen_intro", "1"));
  await page.reload({ waitUntil: "networkidle2" });
  await sleep(800);

  const scrollToHeading = (re) =>
    page.evaluate((reSrc) => {
      const rx = new RegExp(reSrc, "i");
      const h = [...document.querySelectorAll("h1,h2,h3,div,span")].find((e) => rx.test((e.textContent || "").trim()) && e.getBoundingClientRect().height < 80);
      if (h) {
        const card = h.closest("section,div[class*='rounded']") || h;
        card.scrollIntoView({ block: "start" });
        window.scrollBy(0, -16);
      }
    }, re);

  // 1) Screener controls — show "credits left" badge + "Uses ~N credits" cue.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "marketing/frames/01-screener.png" });

  // 2) Run the screen → ranked ZIPs (Stage 1: scatter + ZIP table).
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /^Run screen$/i.test((x.textContent || "").trim()));
    b && b.click();
  });
  await sleep(3800);
  await scrollToHeading("Stage 1");
  await sleep(400);
  await page.screenshot({ path: "marketing/frames/02-zips.png" });

  // 3) Select ZIP 44110 → deal table ranked by Deal Score.
  await page.evaluate(() => {
    const t = document.querySelectorAll("table")[0];
    const r = [...t.querySelectorAll("tbody tr")].find((x) => /44110/.test(x.textContent || ""));
    r && r.click();
  });
  await sleep(3200);
  await scrollToHeading("Stage 2");
  await sleep(400);
  await page.screenshot({ path: "marketing/frames/03-deals.png" });

  // 4) Open the top deal → drawer with $1,925 / +$480 / Score 100 (true-tax underwrite).
  await page.evaluate(() => {
    const t = document.querySelectorAll("table")[1];
    const r = [...t.querySelectorAll("tbody tr")][0];
    r && r.click();
  });
  await sleep(2800);
  await page.screenshot({ path: "marketing/frames/04-drawer.png" });

  // Read back the confirmed numbers for the record.
  const nums = await page.evaluate(() => {
    const txt = document.body.textContent || "";
    const net = (txt.match(/Net cash flow \/ mo\s*\$?([\d,]+)/) || [])[1] || null;
    return { net, hasScore100: /DEAL SCORE = 100/.test(txt), voucher: (txt.match(/Gross rent[^$]*\$([\d,]+)/) || [])[1] || null };
  });
  console.log("captured frames + confirmed:", JSON.stringify(nums));
} finally {
  await browser.close();
}
