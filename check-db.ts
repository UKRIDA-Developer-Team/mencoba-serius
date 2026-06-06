import "dotenv/config";
import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`ALTER TABLE "products" ADD COLUMN "is_recommended" boolean DEFAULT false NOT NULL;`);
    console.log("Column added successfully");
  } catch (err: any) {
    console.error("Error adding column:", err.message);
  }
  process.exit(0);
}
main();
