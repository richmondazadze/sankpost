import { config } from "dotenv";
config();

import { neon } from "@neondatabase/serverless";

import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const sql = process.env.NEXT_PUBLIC_DATABASE_URL 
    ? neon(process.env.NEXT_PUBLIC_DATABASE_URL) 
    : (() => { throw new Error("No database connection string was provided to `neon()`."); })();

export const db = drizzle(sql, { schema });
