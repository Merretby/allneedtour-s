
import * as cheerio from "cheerio";
import fs from "node:fs";

const BASE = "https://universparadiscount.ma";
const START_URLS = [
  `${BASE}/plan-site`,
  `${BASE}/Boutique`,
];

const queue = [...START_URLS];
const visited = new Set();
const products = new Map();
const MAX_PAGES = 10000;

function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl, BASE);

    if (url.hostname !== new URL(BASE).hostname) return null;

    url.hash = "";

    // Remove tracking parameters, but retain catalog pagination
    // and product listing options.
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|gclid|fbclid)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }

    return url.href;
  } catch {
    return null;
  }
}

function isProductUrl(url) {
  const path = new URL(url).pathname;

  // Typical PrestaShop product URLs contain a numeric ID
  // followed by a product slug.
  return /\/\d+-[^/]+\.html$/i.test(path);
}

async function main() {
  while (queue.length && visited.size < MAX_PAGES) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;

    visited.add(url);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 ProductCatalogCrawler/1.0",
        },
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        console.log("Skipped:", response.status, url);
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      $('link[rel="canonical"]').each((_, el) => {
        const canonical = normalizeUrl($(el).attr("href"));
        if (canonical && isProductUrl(canonical)) {
          products.set(canonical, { product_url: canonical });
        }
      });

      $("a[href]").each((_, el) => {
        const href = normalizeUrl($(el).attr("href"));
        if (!href) return;

        if (isProductUrl(href)) {
          products.set(href, { product_url: href });
          return;
        }

        const parsed = new URL(href);
        const sameSite = parsed.hostname === new URL(BASE).hostname;

        if (
          sameSite &&
          !visited.has(href) &&
          !queue.includes(href) &&
          !/\.(jpg|jpeg|png|webp|gif|pdf|zip)$/i.test(parsed.pathname)
        ) {
          queue.push(href);
        }
      });

      if (visited.size % 25 === 0) {
        console.log({
          pagesVisited: visited.size,
          queuedPages: queue.length,
          productUrlsFound: products.size,
        });

        fs.writeFileSync(
          "discovered-products.json",
          JSON.stringify([...products.values()], null, 2)
        );
      }

      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (error) {
      console.log("Request failed:", url, error.message);
    }
  }

  const result = [...products.values()];

  fs.writeFileSync(
    "discovered-products.json",
    JSON.stringify(result, null, 2)
  );

  console.log("\nDiscovery finished.");
  console.log("Pages visited:", visited.size);
  console.log("Unique product URLs:", result.length);
  console.log("Saved to discovered-products.json");
}

main().catch(console.error);
