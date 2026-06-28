import { type InferInsertModel, type InferSelectModel, InferEnum } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as db } from "./schema";

export type DbClient = PostgresJsDatabase<typeof db>;

export type User = InferSelectModel<typeof db.users>;
export type NewUser = InferInsertModel<typeof db.users>;

export type Document = InferSelectModel<typeof db.documents>;
export type NewDocument = InferInsertModel<typeof db.documents>;

export type QrCode = InferSelectModel<typeof db.qrCodes>;
export type NewQrCode = InferInsertModel<typeof db.qrCodes>;

export type DocumentAssignment = InferSelectModel<typeof db.documentAssignments>;
export type NewDocumentAssignment = InferInsertModel<typeof db.documentAssignments>;

export type UserRole = InferEnum<typeof db.userRoleEnum>;
