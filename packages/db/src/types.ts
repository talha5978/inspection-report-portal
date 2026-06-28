import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as db } from "./schema";

export type DbClient = PostgresJsDatabase<typeof db>;

export type User = InferSelectModel<typeof db.users>;
export type NewUser = InferInsertModel<typeof db.users>;
