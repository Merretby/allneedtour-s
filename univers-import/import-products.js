
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SOURCE = "universparadiscount";

function parsePrice(value) {
  if (typeof value === "number") return value;
  if (!value) return null;

  // Supports prices such as "99,00 MAD" and "1 299,00 DH"
  const cleaned = value
    .replace(/\s/g, "")
    .replace(/MAD|DH|DHS|د\.م\.?/gi, "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:,|$))/g, "")
    .replace(",", ".");

  const price = Number(cleaned);
  return Number.isFinite(price) ? price : null;
}

async function main() {
  const products = JSON.parse(
    fs.readFileSync("./products.json", "utf8")
  );

  const rows = products.map((p) => {
    const price = parsePrice(p.price);

    if (price === null || price < 0) {
      throw new Error(
        `Invalid price for "${p.name}": ${p.price}`
      );
    }

    return {
      name: p.name,
      description:
        (typeof p.description === "string" && p.description.trim())
            ? p.description.trim()
            : p.name,
      price,
      stock: 0,
      category: p.category || null,
      brand: null,
      image_url: p.image_url || null,
      source: SOURCE,
      external_id: String(p.external_id),
      product_url: p.product_url || null,
      currency: "MAD",
      source_images: p.image_url ? [p.image_url] : [],
      source_data: p
    };
  });

  const ids = rows.map((p) => p.external_id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(
      "Duplicate external_id values found in products.json. Import cancelled."
    );
  }

  console.log(`Ready to import ${rows.length} products.`);
  console.log("No database changes have been made yet.");

  const { error } = await supabase
    .from("products")
    .upsert(rows, {
      onConflict: "source,external_id"
    });

  if (error) {
    throw new Error(`Supabase import failed: ${error.message}`);
  }

  console.log(`Successfully imported ${rows.length} products.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
