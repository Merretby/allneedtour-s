
import "dotenv/config";
import fs from "node:fs";
import * as cheerio from "cheerio";

const input = JSON.parse(
  fs.readFileSync("./products.json", "utf8")
);

function findProducts(json) {
  if (Array.isArray(json)) {
    return json.flatMap(findProducts);
  }

  if (!json || typeof json !== "object") return [];

  const found = [];

  if (
    json["@type"] === "Product" ||
    (Array.isArray(json["@type"]) &&
      json["@type"].includes("Product"))
  ) {
    found.push(json);
  }

  if (json["@graph"]) found.push(...findProducts(json["@graph"]));

  return found;
}

async function fetchDetails(product) {
  if (!product.product_url) {
    return { ...product, fetch_error: "Missing product URL" };
  }

  try {
    const response = await fetch(product.product_url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProductDataImporter/1.0)"
      },
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const structuredProducts = [];

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).contents().text());
        structuredProducts.push(...findProducts(json));
      } catch {
        // Ignore invalid JSON-LD blocks.
      }
    });

    const detail = structuredProducts[0];

    if (!detail) {
      return {
        ...product,
        fetch_error: "No Product JSON-LD found"
      };
    }

    const offers = Array.isArray(detail.offers)
      ? detail.offers[0]
      : detail.offers;

    const images = Array.isArray(detail.image)
      ? detail.image
      : detail.image
        ? [detail.image]
        : [];

    const brand =
      typeof detail.brand === "string"
        ? detail.brand
        : detail.brand?.name ?? null;

    return {
      ...product,
      description: detail.description ?? null,
      brand,
      sku: detail.sku ?? null,
      barcode: detail.gtin13 ?? detail.gtin ?? detail.gtin8 ?? null,
      category: detail.category ?? product.category ?? null,
      detail_price: offers?.price ?? null,
      currency: offers?.priceCurrency ?? "MAD",
      availability: offers?.availability ?? null,
      product_url: detail.url ?? product.product_url,
      image_url: images[0] ?? product.image_url,
      source_images: images,
      fetch_error: null
    };
  } catch (error) {
    return {
      ...product,
      fetch_error: error.message
    };
  }
}

async function main() {
  const results = [];

  // Start with only 3 products to test.
  for (const product of input) {
    console.log("Fetching:", product.name);
    results.push(await fetchDetails(product));
    await new Promise(resolve => setTimeout(resolve, 700));
  }

  fs.writeFileSync(
    "./enriched-products.json",
    JSON.stringify(results, null, 2),
    "utf8"
  );

  console.log("Test finished:", results.length);
  console.log(
    "Successful:",
    results.filter(p => !p.fetch_error).length
  );
  console.log(
    "Could not fetch:",
    results.filter(p => p.fetch_error).length
  );
  console.log("Saved to enriched-products.json");
}

main().catch(console.error);
