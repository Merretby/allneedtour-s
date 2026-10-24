
import fs from "node:fs";
import * as cheerio from "cheerio";

const INPUT = "./product-urls-clean.json";
const OUTPUT = "./all-products.json";
const CONCURRENCY = 3;
const SAVE_EVERY = 25;
const DELAY_MS = 500;

const input = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const existing = fs.existsSync(OUTPUT)
  ? JSON.parse(fs.readFileSync(OUTPUT, "utf8"))
  : [];

const results = new Map(
  existing.map(p => [String(p.external_id), p])
);

function clean(value) {
  if (typeof value !== "string") return value ?? null;

  const text = value.replace(/\s+/g, " ").trim();
  return text || null;
}

function parsePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (!value) return null;

  const cleaned = String(value)
    .replace(/\s/g, "")
    .replace(/MAD|DHS?|د\.م\.?/gi, "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:,|$))/g, "")
    .replace(",", ".");

  const number = Number(cleaned);

  return Number.isFinite(number) && number >= 0
    ? number
    : null;
}

function findProducts(data) {
  if (Array.isArray(data)) {
    return data.flatMap(findProducts);
  }

  if (!data || typeof data !== "object") return [];

  const type = data["@type"];
  const found =
    type === "Product" ||
    (Array.isArray(type) && type.includes("Product"))
      ? [data]
      : [];

  if (data["@graph"]) {
    found.push(...findProducts(data["@graph"]));
  }

  return found;
}

function firstValue($, selectors, attribute = null) {
  for (const selector of selectors) {
    const element = $(selector).first();
    if (!element.length) continue;

    const value = attribute
      ? element.attr(attribute)
      : element.text();

    const result = clean(value);
    if (result) return result;
  }

  return null;
}

function validDescription(value, name) {
  const description = clean(value);

  if (!description || description.length < 20) return null;

  // Reject breadcrumbs and navigation text.
  if (/^(?:-\s*){1,}?(?:accueil|home|boutique|masques visage|sérums et huiles|brosses à dents adultes)\b/i.test(description)) {
    return null;
  }

  // Known unrelated recommendation text seen across failed pages.
  if (/PRODUITS COREENS ERBORIAN OFFRE SET AND CARE POWER/i.test(description)) {
    return null;
  }

  // Reject descriptions that are just the product name.
  if (
    name &&
    description.toLowerCase() === name.toLowerCase()
  ) {
    return null;
  }

  return description;
}

function absoluteUrl(value, baseUrl) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value, baseUrl);

    if (!["http:", "https:"].includes(url.protocol)) return null;

    return url.href;
  } catch {
    return null;
  }
}

function getMeta($, selectors) {
  for (const selector of selectors) {
    const value = clean($(selector).first().attr("content"));
    if (value) return value;
  }

  return null;
}

async function fetchProduct(product) {
  const id = String(product.external_id);

  try {
    const response = await fetch(product.product_url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml"
      },
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let detail = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const raw = $(el).html();
        if (!raw) return;

        const json = JSON.parse(raw);
        const products = findProducts(json);

        // Prefer a Product that has a name.
        const candidate = products.find(p => clean(p.name));

        if (!detail && candidate) detail = candidate;
      } catch {
        // Ignore malformed JSON-LD.
      }
    });

    const offers = Array.isArray(detail?.offers)
      ? detail.offers[0]
      : detail?.offers;
   
    function validProductName(value) {
    const name = clean(value);
    if (!name || name.length < 3) return null;

  // Reject generic website titles and page headings.
    if (/^para pharmacie\b/i.test(name)) return null;
    if (/^para pharmacie en ligne\b/i.test(name)) return null;
    if (/^univers paradiscount\b/i.test(name)) return null;
    if (/solutions bien-être à votre portée/i.test(name)) return null;
    if (/^accueil$/i.test(name)) return null;

    return name;
    }

    const name =
        validProductName(detail?.name) ||
        validProductName(firstValue($, [
            "h1[itemprop='name']",
            ".product-title h1",
            "h1.product-name",
            ".product-information h1"
        ])) ||
        validProductName(getMeta($, [
            'meta[property="og:title"]',
            'meta[name="twitter:title"]'
        ]));

    // Do not use generic page headings or the entire page title.
    const rawDescription =
      clean(detail?.description) ||
      getMeta($, [
        'meta[property="og:description"]',
        'meta[name="description"]'
      ]) ||
      firstValue($, [
        "#description .product-description",
        ".product-description",
        ".product-information [itemprop='description']",
        '[itemprop="description"]'
      ]);

    const description = validDescription(rawDescription, name);

    const rawPrice =
      offers?.price ??
      getMeta($, [
        'meta[property="product:price:amount"]'
      ]) ??
      $('[itemprop="price"]').first().attr("content") ??
      firstValue($, [
        ".product-information .current-price span",
        ".product-prices .current-price",
        ".current-price"
      ]);

    const price = parsePrice(rawPrice);

    const brandValue = detail?.brand;
    const brand =
      typeof brandValue === "string"
        ? clean(brandValue)
        : clean(brandValue?.name) ||
          firstValue($, [
            ".product-manufacturer a",
            ".product-manufacturer",
            '[itemprop="brand"]'
          ]);

    const sku =
      clean(detail?.sku) ||
      firstValue($, [
        '[itemprop="sku"]',
        ".product-reference"
      ]);

    const category =
      clean(detail?.category) ||
      firstValue($, [
        ".breadcrumb li:nth-last-child(2) a",
        ".breadcrumb li:nth-last-child(2)"
      ]);

    const barcode =
      detail?.gtin13 ||
      detail?.gtin12 ||
      detail?.gtin8 ||
      detail?.gtin ||
      null;

    const rawImages = Array.isArray(detail?.image)
      ? detail.image
      : detail?.image
        ? [detail.image]
        : [];

    const htmlImages = $(
      ".product-images img, " +
      ".product-image img, " +
      ".images-container img, " +
      "#product-images img, " +
      ".product-cover img"
    )
      .map((_, el) =>
        $(el).attr("data-full-size-image-url") ||
        $(el).attr("data-image-large-src") ||
        $(el).attr("data-src") ||
        $(el).attr("src")
      )
      .get();

    const images = [
      ...new Set(
        [...rawImages, ...htmlImages, ...(product.image_url ? [product.image_url] : [])]
          .map(url => absoluteUrl(
            typeof url === "object" ? url.url : url,
            product.product_url
          ))
          .filter(Boolean)
          .filter(url => !/placeholder|no-image|default-image/i.test(url))
      )
    ];

    const availability =
      clean(offers?.availability) ||
      firstValue($, [
        "#product-availability",
        ".product-availability"
      ]);

    return {
      external_id: id,
      product_url: product.product_url,
      name: name || null,
      description,
      price,
      currency: offers?.priceCurrency || "MAD",
      brand: brand || null,
      sku: sku || null,
      barcode,
      category: category || null,
      image_url: images[0] || null,
      source_images: images,
      availability: availability || null,
      fetch_error: !name
        ? "Product name not found"
        : price === null
          ? "Product price not found"
          : null,
      fetched_at: new Date().toISOString()
    };
  } catch (error) {
    return {
      external_id: id,
      product_url: product.product_url,
      fetch_error: error.message,
      fetched_at: new Date().toISOString()
    };
  }
}

function needsRetry(record) {
  if (!record) return true;

  // Retry previous errors and records with important missing fields.
  return Boolean(
    record.fetch_error ||
    !clean(record.name) ||
    record.price == null ||
    !clean(record.image_url)
  );
}

function mergeRecord(oldRecord, freshRecord) {
  if (!oldRecord) return freshRecord;

  // A failed HTTP request should not erase previously collected data.
  if (
    freshRecord.fetch_error &&
    !freshRecord.name
  ) {
    return {
      ...oldRecord,
      product_url: freshRecord.product_url || oldRecord.product_url,
      last_retry_error: freshRecord.fetch_error,
      last_retry_at: freshRecord.fetched_at
    };
  }

  const merged = {
    ...oldRecord,
    ...freshRecord
  };

  // Never keep the known unrelated description.
  if (
    /PRODUITS COREENS ERBORIAN OFFRE SET AND CARE POWER/i.test(
      merged.description || ""
    )
  ) {
    merged.description = null;
  }

  // If the new request didn't find a value, preserve old data only
  // when that old value is still usable.
  for (const key of ["name", "description", "price", "image_url"]) {
    if (
      freshRecord[key] == null &&
      oldRecord[key] != null
    ) {
      if (
        key !== "description" ||
        validDescription(oldRecord[key], merged.name)
      ) {
        merged[key] = oldRecord[key];
      }
    }
  }

  merged.source_images =
    freshRecord.source_images?.length
      ? freshRecord.source_images
      : oldRecord.source_images || [];

  merged.fetch_error =
    !merged.name
      ? "Product name not found"
      : merged.price == null
        ? "Product price not found"
        : null;

  return merged;
}

function save() {
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify([...results.values()], null, 2)
  );
}

const todo = input.filter(product =>
  needsRetry(results.get(String(product.external_id)))
);

let next = 0;
let completed = 0;

async function worker() {
  while (true) {
    const index = next++;
    if (index >= todo.length) return;

    const product = todo[index];
    const id = String(product.external_id);
    const oldRecord = results.get(id);
    const freshRecord = await fetchProduct(product);

    results.set(id, mergeRecord(oldRecord, freshRecord));
    completed++;

    if (completed % SAVE_EVERY === 0) {
      save();

      console.log({
        retriedThisRun: completed,
        retryQueue: todo.length,
        totalSaved: results.size,
        namedProducts: [...results.values()].filter(p => p.name).length,
        missingPrices: [...results.values()].filter(p => p.price == null).length,
        missingImages: [...results.values()].filter(p => !p.image_url).length,
        errors: [...results.values()].filter(p => p.fetch_error).length
      });
    }

    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }
}

async function main() {
  console.log("Unique product URLs:", input.length);
  console.log("Already saved:", results.size);
  console.log("Need retry:", todo.length);

  await Promise.all(
    Array.from(
      { length: Math.min(CONCURRENCY, todo.length) },
      () => worker()
    )
  );

  save();

  const all = [...results.values()];

  console.log("\nRetry finished.");
  console.log("Total saved:", results.size);
  console.log("Products with names:", all.filter(p => p.name).length);
  console.log("Missing prices:", all.filter(p => p.price == null).length);
  console.log("Missing images:", all.filter(p => !p.image_url).length);
  console.log("Remaining errors:", all.filter(p => p.fetch_error).length);
  console.log("Output:", OUTPUT);
}

main().catch(error => {
  save();
  console.error(error);
  process.exitCode = 1;
});
