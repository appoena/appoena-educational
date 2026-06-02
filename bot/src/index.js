import { chromium } from "playwright";

const frontendUrl = process.env.FRONTEND_URL || "http://frontend:5173";
const concurrency = positiveInt(process.env.BOT_CONCURRENCY, 3);
const minDelayMs = positiveInt(process.env.BOT_MIN_DELAY_MS, 300);
const maxDelayMs = Math.max(positiveInt(process.env.BOT_MAX_DELAY_MS, 3000), minDelayMs);
const headless = String(process.env.BOT_HEADLESS || "true").toLowerCase() !== "false";

const firstNames = [
  "Alex",
  "Bianca",
  "Camila",
  "Diego",
  "Elena",
  "Felipe",
  "Grace",
  "Hugo",
  "Iris",
  "Jonas",
  "Lina",
  "Mateo"
];

const lastNames = [
  "Morgan",
  "Silva",
  "Santos",
  "Parker",
  "Oliveira",
  "Rivera",
  "Costa",
  "Miller",
  "Almeida",
  "Brooks"
];

const streets = [
  "Market Street",
  "Cedar Avenue",
  "Willow Lane",
  "Ocean Drive",
  "Maple Road",
  "Station Street",
  "Garden Way",
  "Highland Road"
];

const cities = [
  "Austin, TX",
  "Chicago, IL",
  "Denver, CO",
  "Portland, OR",
  "Raleigh, NC",
  "Seattle, WA",
  "Boston, MA",
  "Miami, FL"
];

const supportSubjects = [
  "Shipping question",
  "Change subscription",
  "Tea recommendation",
  "Invoice copy",
  "Gift order help"
];

const supportMessages = [
  "Can you confirm when my tea subscription renews?",
  "I want to update the delivery address before the next order.",
  "Which tea is closest to a smooth breakfast blend?",
  "Please send a copy of the last invoice.",
  "I need help choosing a gift for a friend."
];

const journeys = [
  { name: "happy-buyer", run: runHappyBuyer },
  { name: "indecisive-browser", run: runIndecisiveBrowser },
  { name: "payment-error", run: runPaymentError },
  { name: "support-user", run: runSupportUser },
  { name: "explorer", run: runExplorer }
];

console.log("[bot] Tea Shop Demo bot starting");
console.log(
  `[bot] frontend=${frontendUrl} concurrency=${concurrency} headless=${headless} delay=${minDelayMs}-${maxDelayMs}ms`
);

await waitForFrontend();

const browser = await chromium.launch({ headless });

process.on("SIGINT", () => shutdown(browser));
process.on("SIGTERM", () => shutdown(browser));

await Promise.all(Array.from({ length: concurrency }, (_, index) => workerLoop(index + 1, browser)));

async function workerLoop(workerId, browserInstance) {
  while (true) {
    const journey = sample(journeys);
    const user = fakeUser();
    const viewport = sample([
      { width: 1440, height: 920 },
      { width: 1280, height: 850 },
      { width: 1024, height: 780 },
      { width: 390, height: 844 }
    ]);
    const context = await browserInstance.newContext({
      viewport,
      locale: "en-US",
      timezoneId: "America/New_York"
    });
    const page = await context.newPage();
    page.setDefaultTimeout(18_000);

    log(workerId, `starting journey=${journey.name} user=${user.name} <${user.email}>`);

    try {
      await journey.run(page, user, workerId);
      log(workerId, `success journey=${journey.name} userId=${user.id}`);
    } catch (error) {
      log(workerId, `error journey=${journey.name} message=${error.message}`);
    } finally {
      await context.close();
      await waitRandom(null, 1200, 5400);
    }
  }
}

async function runHappyBuyer(page, user, workerId) {
  await openJourney(page, user, "happy-buyer", "/");
  await click(page, page.getByRole("link", { name: /Browse products/i }), "browse products", workerId);
  await searchProducts(page, sample(["green", "chai", "jasmine", "oolong"]), workerId);
  await humanScroll(page, 3, workerId);
  await openRandomProduct(page, workerId);
  await maybeAdjustDetailQuantity(page, workerId);
  await click(page, page.getByRole("button", { name: /Add to cart/i }), "add to cart", workerId);
  await click(page, page.getByRole("link", { name: /Checkout/i }).last(), "drawer checkout", workerId);
  await fillCheckout(page, user, false, workerId);
  await click(page, page.getByRole("button", { name: /Pay now/i }), "submit payment", workerId);
  await page.getByText(/Order confirmed/i).waitFor();
  await waitRandom(page);
}

async function runIndecisiveBrowser(page, user, workerId) {
  await openJourney(page, user, "indecisive-browser", "/products");
  await chooseRandomCategory(page, workerId);
  await humanScroll(page, randomInt(3, 6), workerId);

  for (let index = 0; index < randomInt(1, 3); index += 1) {
    await openRandomProduct(page, workerId);
    await waitRandom(page);
    await page.goBack({ waitUntil: "domcontentloaded" });
    await waitRandom(page);
    await humanScroll(page, 2, workerId);
  }

  if (Math.random() > 0.45) {
    await openRandomProduct(page, workerId);
    await click(page, page.getByRole("button", { name: /Add to cart/i }), "add then abandon", workerId);
    await click(page, page.getByRole("button", { name: /Close/i }), "close drawer", workerId);
  }

  await waitRandom(page, 2000, 6000);
}

async function runPaymentError(page, user, workerId) {
  await openJourney(page, user, "payment-error", "/products");
  await searchProducts(page, sample(["black", "rooibos", "matcha", "chai"]), workerId);
  await openRandomProduct(page, workerId);
  await click(page, page.getByRole("button", { name: /Add to cart/i }), "add to cart", workerId);
  await click(page, page.getByRole("link", { name: /Checkout/i }).last(), "drawer checkout", workerId);
  await fillCheckout(page, user, true, workerId);
  await click(page, page.getByRole("button", { name: /Pay now/i }), "submit failing payment", workerId);
  await page.getByText(/declined|failure|PAYMENT/i).first().waitFor();
  await waitRandom(page, 1500, 4200);
}

async function runSupportUser(page, user, workerId) {
  await openJourney(page, user, "support-user", "/support");
  const forceError = Math.random() > 0.72;
  await fillByLabel(page, "Name", user.name);
  await fillByLabel(page, "Email", forceError ? user.email.replace("@", "+fail@") : user.email);
  await selectByLabel(page, "Priority", sample(["low", "normal", "high"]));
  await fillByLabel(page, "Subject", forceError ? "erro no pedido" : sample(supportSubjects));
  await fillByLabel(page, "Message", sample(supportMessages));
  await waitRandom(page);
  await click(page, page.getByRole("button", { name: /Submit ticket/i }), "submit support", workerId);
  await page.locator(".success-box, .inline-error").first().waitFor();
  await waitRandom(page, 1500, 4600);
}

async function runExplorer(page, user, workerId) {
  await openJourney(page, user, "explorer", "/");
  await humanScroll(page, 2, workerId);
  await click(page, page.getByRole("link", { name: "Products" }).first(), "nav products", workerId);
  await humanScroll(page, 5, workerId);

  if (Math.random() > 0.5) {
    await searchProducts(page, sample(["mint", "berry", "cacao", "lemon"]), workerId);
  }

  await openRandomProduct(page, workerId);
  await humanScroll(page, 2, workerId);
  await page.goto(buildJourneyUrl(user, "explorer", "/products/unknown-tea"), {
    waitUntil: "domcontentloaded"
  });
  await page.getByText(/Product not found/i).waitFor();
  await waitRandom(page);
  await click(page, page.getByRole("link", { name: "Support" }).first(), "nav support", workerId);
  await humanScroll(page, 1, workerId);
  await click(page, page.getByRole("link", { name: "Cart" }).first(), "nav cart", workerId);
  await waitRandom(page, 1800, 5200);
}

async function openJourney(page, user, journeyName, path) {
  await page.goto(buildJourneyUrl(user, journeyName, path), { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await waitRandom(page);
}

function buildJourneyUrl(user, journeyName, path) {
  const url = new URL(path, frontendUrl);
  url.searchParams.set("demoUserId", user.id);
  url.searchParams.set("demoUserName", user.name);
  url.searchParams.set("demoUserEmail", user.email);
  url.searchParams.set("journey", journeyName);
  return url.toString();
}

async function searchProducts(page, term, workerId) {
  await fillByLabel(page, "Search products", term);
  await click(page, page.getByRole("button", { name: /^Search$/i }), `search ${term}`, workerId);
  await page.locator(".product-card, .error-state, .empty-state").first().waitFor();
  await waitRandom(page);
}

async function chooseRandomCategory(page, workerId) {
  const select = page.getByLabel("Filter by category");
  await select.waitFor();
  const options = await select.locator("option").evaluateAll((nodes) =>
    nodes.map((node) => ({ value: node.value, label: node.textContent || "" })).filter((item) => item.value)
  );

  if (options.length === 0) {
    return;
  }

  const option = sample(options);
  log(workerId, `select category=${option.label.trim()}`);
  await select.selectOption(option.value);
  await waitRandom(page);
}

async function openRandomProduct(page, workerId) {
  await page.locator(".product-card").first().waitFor();
  const cards = page.locator(".product-card");
  const count = await cards.count();
  const index = randomInt(0, Math.max(0, Math.min(count - 1, 7)));
  log(workerId, `open product card index=${index}`);
  await moveMouse(page);
  await cards.nth(index).getByRole("link").first().click();
  await page.locator(".detail-page, .error-state").first().waitFor();
  await waitRandom(page);
}

async function maybeAdjustDetailQuantity(page, workerId) {
  if (Math.random() < 0.55) {
    log(workerId, "increase quantity");
    await click(page, page.getByRole("button", { name: /Increase quantity/i }).last(), "increase quantity", workerId);
  }
}

async function fillCheckout(page, user, forceError, workerId) {
  log(workerId, `fill checkout forceError=${forceError}`);
  await fillByLabel(page, "Name", user.name);
  await fillByLabel(page, "Email", user.email);
  await fillByLabel(page, "Address", user.address);
  await selectByLabel(page, "Payment method", forceError ? "unstable-card" : sample(["credit-card", "pix"]));
  await fillByLabel(page, "Card number", forceError ? "4000 0000 0000 0000" : "4242 4242 4242 4242");
  await waitRandom(page);
}

async function fillByLabel(page, label, value) {
  const locator = labelLocator(page, label);
  await locator.waitFor();
  await moveMouse(page);
  await locator.fill("");
  await waitRandom(page, 120, 500);
  await locator.type(value, { delay: randomInt(20, 95) });
  await waitRandom(page);
}

async function selectByLabel(page, label, value) {
  const locator = labelLocator(page, label);
  await locator.waitFor();
  await moveMouse(page);
  await locator.selectOption(value);
  await waitRandom(page);
}

function labelLocator(page, label) {
  return page.getByLabel(new RegExp(`^${escapeRegExp(label)}`, "i")).first();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function click(page, locator, label, workerId) {
  log(workerId, `click ${label}`);
  await locator.waitFor({ state: "visible" });
  await moveMouse(page);
  await waitRandom(page, 120, 700);
  await locator.click({ delay: randomInt(30, 140) });
  await waitRandom(page);
}

async function humanScroll(page, steps, workerId) {
  log(workerId, `scroll steps=${steps}`);
  for (let index = 0; index < steps; index += 1) {
    await moveMouse(page);
    await page.mouse.wheel(0, randomInt(240, 760));
    await waitRandom(page, 180, 900);
  }
}

async function moveMouse(page) {
  const viewport = page.viewportSize() || { width: 1280, height: 800 };
  await page.mouse.move(randomInt(40, viewport.width - 40), randomInt(80, viewport.height - 80), {
    steps: randomInt(5, 18)
  });
}

async function waitRandom(page, min = minDelayMs, max = maxDelayMs) {
  const timeout = randomInt(min, max);
  if (page) {
    await page.waitForTimeout(timeout);
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, timeout));
}

async function waitForFrontend() {
  for (let attempt = 1; attempt <= 90; attempt += 1) {
    try {
      const response = await fetch(frontendUrl);
      if (response.ok) {
        console.log("[bot] frontend is ready");
        return;
      }
    } catch {
      // keep waiting
    }

    console.log(`[bot] waiting for frontend attempt=${attempt}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Frontend did not become available at ${frontendUrl}`);
}

async function shutdown(browserInstance) {
  console.log("[bot] shutting down");
  await browserInstance.close().catch(() => undefined);
  process.exit(0);
}

function fakeUser() {
  const first = sample(firstNames);
  const last = sample(lastNames);
  const id = `bot-${Date.now().toString(36)}-${randomInt(1000, 9999)}`;
  const slug = `${first}.${last}`.toLowerCase();

  return {
    id,
    name: `${first} ${last}`,
    email: `${slug}.${randomInt(10, 999)}@example.test`,
    address: `${randomInt(100, 9999)} ${sample(streets)}, ${sample(cities)}`
  };
}

function sample(items) {
  return items[randomInt(0, items.length - 1)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function log(workerId, message) {
  console.log(`[bot:${workerId}] ${message}`);
}
