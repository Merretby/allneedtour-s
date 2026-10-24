
import fs from "node:fs";

const input = JSON.parse(
  fs.readFileSync("./discovered-products.json", "utf8")
);

const productsById = new Map();
const invalidUrls = [];

for (const item of input) {
  const url = item.product_url;

  if (!url) continue;

  try {
    const parsed = new URL(url);

    // Keep only URLs from the supplier website.
    if (parsed.hostname !== "universparadiscount.ma") {
      invalidUrls.push(url);
      continue;
    }

    // Extract the numeric product ID from URLs such as:
    // /parfums/26875-product-name.html
    const match = parsed.pathname.match(/\/(\d+)-[^/]+\.html$/i);

    if (!match) {
      invalidUrls.push(url);
      continue;
    }

    const externalId = match[1];

    // Remove query strings and fragments from product URLs.
    const cleanUrl = `${parsed.origin}${parsed.pathname}`;

    if (!productsById.has(externalId)) {
      productsById.set(externalId, {
        external_id: externalId,
        product_url: cleanUrl
      });
    }
  } catch {
    invalidUrls.push(url);
  }
}

const products = [...productsById.values()];

fs.writeFileSync(
  "./product-urls-clean.json",
  JSON.stringify(products, null, 2)
);

console.log("Discovered links:", input.length);
console.log("Unique product IDs:", products.length);
console.log("Invalid/non-product links:", invalidUrls.length);
console.log("Saved to product-urls-clean.json");
console.log("Sample products:", products.slice(0, 5));
