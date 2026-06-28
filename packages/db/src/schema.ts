import { boolean, pgTable, text, timestamp, uuid, uniqueIndex, pgEnum, index } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "client"]);

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull(),
		authId: text("auth_id").notNull(),
		isActive: boolean("is_active").notNull().default(true),
		role: userRoleEnum("role").notNull().default("client"),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "date",
		})
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "date",
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("users_email_unique").on(table.email),
		uniqueIndex("users_auth_id_unique").on(table.authId),
	],
);

export const documents = pgTable(
	"documents",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: text("title").notNull(),
		fileName: text("file_name").notNull(),
		fileUrl: text("file_url").notNull(), // Google Drive direct link or public URL
		fileId: text("file_id").notNull(), // Google Drive file ID
		uploadedBy: uuid("uploaded_by").references(() => users.id),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
	},
	(table) => [index("documents_uploaded_by_idx").on(table.uploadedBy)],
);

export const documentAssignments = pgTable(
	"document_assignments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		documentId: uuid("document_id")
			.references(() => documents.id, { onDelete: "cascade" })
			.notNull(),
		clientId: uuid("client_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
	},
	(table) => [index("doc_assignments_client_idx").on(table.clientId)],
);

export const qrCodes = pgTable(
	"qr_codes",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		documentId: uuid("document_id")
			.references(() => documents.id, { onDelete: "cascade" })
			.notNull(),
		shortCode: text("short_code").notNull().unique(),
		equipmentName: text("equipment_name"),
		equipmentLocation: text("equipment_location"),
		createdBy: uuid("created_by").references(() => users.id),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
	},
	(table) => [
		index("qr_codes_shortcode_idx").on(table.shortCode),
		index("qr_codes_createdby_idx").on(table.createdBy),
	],
);

export const schema = {
	userRoleEnum,
	users,
	documents,
	documentAssignments,
	qrCodes,
} as const;
