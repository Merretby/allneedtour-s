
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env"
  );
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);

const SOURCE = "universparadiscount";
const BATCH_SIZE = 100;

function parsePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) return null;

  // Supports prices such as "99,00 MAD" and "1 299,00 DH"
  const cleaned = String(value)
    .replace(/\s/g, "")
    .replace(/MAD|DHS?|د\.م\.?/gi, "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:,|$))/g, "")
    .replace(",", ".");

  const price = Number(cleaned);

  return Number.isFinite(price) ? price : null;
}

function isValidProductName(value) {
  if (typeof value !== "string") return false;

  const name = value.trim();

  if (name.length < 3) return false;

  // Reject generic website titles, not actual product names
  if (/^para pharmacie\b/i.test(name)) return false;
  if (/^para pharmacie en ligne\b/i.test(name)) return false;
  if (/^univers paradiscount\b/i.test(name)) return false;
  if (/solutions bien-être à votre portée/i.test(name)) return false;
  if (/^accueil$/i.test(name)) return false;

  return true;
}

async function main() {
  // Read the complete scraped catalog
  const products = JSON.parse(
    fs.readFileSync("./all-products.json", "utf8")
  );

  if (!Array.isArray(products)) {
    throw new Error("all-products.json must contain a JSON array.");
  }

  const skipped = [];
  const rows = [];

  for (const p of products) {
    const price = parsePrice(p.price);

    // Skip products with missing or invalid essential information
    if (
      !isValidProductName(p.name) ||
      price === null ||
      price < 0 ||
      !p.image_url ||
      !p.external_id
    ) {
      skipped.push({
        id: p.external_id ?? null,
        name: p.name ?? null,
        reason: "Missing or invalid name, price, image, or external ID"
      });

      continue;
    }

    rows.push({
      name: p.name.trim(),
      description:
        typeof p.description === "string" && p.description.trim()
          ? p.description.trim()
          : p.name.trim(),
      price,
      stock: 0,
      category: p.category?.trim() || "Divers",
      brand: p.brand || null,
      image_url: p.image_url,
      source: SOURCE,
      external_id: String(p.external_id),
      product_url: p.product_url || null,
      currency: p.currency || "MAD",
      source_images: Array.isArray(p.source_images)
        ? p.source_images
        : [p.image_url],
      source_data: p
    });
  }

  // Prevent duplicate source IDs in the import batch
  const ids = rows.map((p) => p.external_id);

  if (new Set(ids).size !== ids.length) {
    throw new Error(
      "Duplicate external_id values found. Import cancelled."
    );
  }

  console.log(`Scraped products: ${products.length}`);
  console.log(`Valid products to import: ${rows.length}`);
  console.log(`Skipped products: ${skipped.length}`);

  // Save the skipped products for later inspection
  fs.writeFileSync(
    "./skipped-products.json",
    JSON.stringify(skipped, null, 2),
    "utf8"
  );

  console.log("Skipped products saved to skipped-products.json");

  if (rows.length === 0) {
    console.log("No valid products to import.");
    return;
  }

  // Import in batches to avoid oversized Supabase requests
  let imported = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from("products")
      .upsert(batch, {
        onConflict: "source,external_id"
      });

    if (error) {
      throw new Error(
        `Supabase import failed at batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`
      );
    }

    imported += batch.length;

    console.log(
      `Imported ${imported}/${rows.length} products...`
    );
  }

  console.log("\nImport completed successfully.");
  console.log(`Products processed: ${imported}`);
  console.log(`Products skipped: ${skipped.length}`);
  console.log(
    "Existing products from other sources were not targeted by this import."
  );
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exitCode = 1;
});
