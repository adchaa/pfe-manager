import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseURL = process.env.MEASUREMENT_BASE_URL;
if (!baseURL) throw new Error("MEASUREMENT_BASE_URL is required");

const browser = await chromium.launch({ headless: true });
const browserContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await browserContext.newPage();
await page.addInitScript(() => {
  window.__lcp = null;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    if (entries.length) window.__lcp = entries.at(-1).startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
});

try {
  await page.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  const headingVisible = await page.getByText("Login", { exact: true }).first().isVisible();
  const email = page.getByLabel("Email");
  const password = page.getByLabel("Password");
  const labelsPresent = await email.count() === 1 && await password.count() === 1;
  const submitButton = page.locator('form button[type="submit"]');
  const submitButtonText = (await submitButton.innerText()).trim();
  await submitButton.click();
  const validationMessages = await page.locator('[aria-invalid="true"]').count();
  const signupLinkWorks = await page.getByRole("link", { name: "Sign up" }).getAttribute("href") === "/signup";

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const seriousCritical = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact));

  await page.setViewportSize({ width: 320, height: 720 });
  await page.waitForTimeout(100);
  const responsive = await page.evaluate(() => ({
    viewport_width: window.innerWidth,
    document_width: document.documentElement.scrollWidth,
    horizontal_overflow_320px: document.documentElement.scrollWidth > window.innerWidth,
  }));
  const lcp = await page.evaluate(() => window.__lcp);

  const output = {
    journey: {
      passed: headingVisible && labelsPresent && submitButtonText === "Login" && validationMessages === 2 && signupLinkWorks,
      login_heading_visible: headingVisible,
      labeled_email_and_password: labelsPresent,
      submit_button_text: submitButtonText,
      invalid_fields_after_empty_submit: validationMessages,
      signup_link_present: signupLinkWorks,
    },
    accessibility: {
      ruleset: "axe-core WCAG 2.0/2.1/2.2 A and AA tags",
      total_violations: axe.violations.length,
      serious_critical_violations: seriousCritical.length,
      findings: seriousCritical.slice(0, 10).map((item) => ({
        id: item.id,
        impact: item.impact,
        help: item.help,
        nodes: item.nodes.length,
      })),
    },
    responsive,
    performance: { lcp_ms: lcp === null ? null : Math.round(lcp) },
    environment: { browser: "Chromium", page: "/login", viewport: "1280x800 then 320x720" },
  };
  process.stdout.write(`${JSON.stringify(output)}\n`);
} finally {
  await browser.close();
}
