import { documentAssignments, documents, qrCodes, users } from "@inspection-report-portal/db";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { requireRole } from "~/middlewares/roleGaurd";
import { googleDriveService } from "~/services/google-drive.service";
import { ApiError } from "~/utils/ApiError";

export async function documentRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/create",
		{
			preHandler: [requireRole(["admin"])],
		},
		async (request, reply) => {
			let driveFileId: string | null = null;

			try {
				const data = await request.file();

				if (!data) {
					throw new ApiError("No file uploaded", 400, "NO_FILE_UPLOADED");
				}

				const title = (data.fields.title as any)?.value as string | undefined;

				const result = await fastify.db.transaction(async (tx) => {
					const driveFile = await googleDriveService.uploadPDF(data.file, data.filename);
					driveFileId = driveFile.id;

					await googleDriveService.makeFilePublic(driveFile.id);

					const userResult = await tx
						.select({ id: users.id })
						.from(users)
						.where(eq(users.authId, request.user!.id))
						.limit(1);

					if (!userResult.length) {
						throw new ApiError("Local user not found", 404, "USER_NOT_FOUND");
					}

					const [newDocument] = await tx
						.insert(documents)
						.values({
							title: title?.trim() ?? driveFile.name,
							fileName: driveFile.name,
							fileUrl: driveFile.webViewLink,
							fileId: driveFile.id,
							uploadedBy: userResult[0].id,
						})
						.returning();

					return { newDocument };
				});

				return reply.success({ document: result.newDocument }, "Document uploaded successfully", 201);
			} catch (error) {
				if (driveFileId) {
					await googleDriveService.deleteFile(driveFileId);
				}

				console.error(error);
				throw error;
			}
		},
	);

	fastify.get(
		"/list",
		{
			preHandler: [requireRole(["admin"])],
		},
		async (request, reply) => {
			try {
				const {
					pageIndex = "0",
					pageSize = "10",
					search = "",
				} = request.query as {
					pageIndex?: string;
					pageSize?: string;
					search?: string;
				};

				const page = parseInt(pageIndex);
				const limit = parseInt(pageSize);
				const offset = page * limit;

				const searchTerm = search.trim();

				let whereCondition = undefined;
				if (searchTerm) {
					whereCondition = or(
						ilike(documents.title, `%${searchTerm}%`),
						ilike(documents.fileName, `%${searchTerm}%`),
					);
				}

				const docs = await fastify.db
					.select({
						id: documents.id,
						title: documents.title,
						fileName: documents.fileName,
						fileUrl: documents.fileUrl,
						createdAt: documents.createdAt,
						assignedClients: count(documentAssignments.id),
					})
					.from(documents)
					.leftJoin(documentAssignments, eq(documents.id, documentAssignments.documentId))
					.where(whereCondition)
					.groupBy(documents.id)
					.orderBy(desc(documents.createdAt))
					.limit(limit)
					.offset(offset);

				const totalResult = await fastify.db
					.select({ count: count() })
					.from(documents)
					.where(whereCondition);

				const total = totalResult[0].count;

				return reply.success({
					documents: docs,
					pagination: {
						page,
						pageSize: limit,
						total,
						pageCount: Math.ceil(total / limit),
					},
				});
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
	);

	fastify.post(
		"/assign",
		{
			preHandler: [requireRole(["admin"])],
			schema: {
				body: {
					type: "object",
					required: ["documentId", "clientIds"],
					properties: {
						documentId: { type: "string", format: "uuid" },
						clientIds: {
							type: "array",
							items: { type: "string", format: "uuid" },
							minItems: 1,
						},
					},
					additionalProperties: false,
				},
			},
		},
		async (request, reply) => {
			try {
				const { documentId, clientIds } = request.body as {
					documentId: string;
					clientIds: string[];
				};

				const [document] = await fastify.db
					.select({ title: documents.title })
					.from(documents)
					.where(eq(documents.id, documentId))
					.limit(1);

				if (!document) {
					throw new ApiError("Document not found", 404, "DOCUMENT_NOT_FOUND");
				}

				// Verify clients exist and are clients
				const validClients = await fastify.db
					.select({ id: users.id })
					.from(users)
					.where(and(inArray(users.id, clientIds), eq(users.role, "client")));

				if (validClients.length !== clientIds.length) {
					throw new ApiError("Some clients are invalid or not found", 400, "INVALID_CLIENTS");
				}

				const assignments = clientIds.map((clientId) => ({
					documentId,
					clientId,
				}));

				const inserted = await fastify.db
					.insert(documentAssignments)
					.values(assignments)
					.onConflictDoNothing()
					.returning();

				return reply.success(
					{
						assignedCount: inserted.length,
						totalRequested: clientIds.length,
					},
					`Clients assigned successfully to the document ${document.title}`,
					200,
				);
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
	);

	fastify.get(
		"/document/:id",
		{
			preHandler: [requireRole(["admin"])],
			schema: {
				params: {
					type: "object",
					required: ["id"],
					properties: {
						id: { type: "string", format: "uuid" },
					},
					additionalProperties: true,
				},
			},
		},
		async (request, reply) => {
			try {
				const { id } = request.params as { id: string };

				const { pageSize = "20" } = request.query as {
					pageSize?: string;
				};

				const [document] = await fastify.db
					.select({
						id: documents.id,
						title: documents.title,
						fileName: documents.fileName,
						fileUrl: documents.fileUrl,
						createdAt: documents.createdAt,
						assignedClients: count(documentAssignments.id),
					})
					.from(documents)
					.leftJoin(documentAssignments, eq(documents.id, documentAssignments.documentId))
					.where(eq(documents.id, id))
					.groupBy(documents.id)
					.limit(1);

				if (!document) {
					throw new ApiError("Document not found", 404, "DOCUMENT_NOT_FOUND");
				}

				const assignedClients = await fastify.db
					.select({
						id: users.id,
						name: users.name,
						email: users.email,
						isActive: users.isActive,
					})
					.from(documentAssignments)
					.innerJoin(users, eq(documentAssignments.clientId, users.id))
					.where(eq(documentAssignments.documentId, id))
					.orderBy(users.name)
					.limit(parseInt(pageSize));

				return reply.success({
					document,
					assignedClients,
				});
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
	);

	fastify.post(
		"/unassign",
		{
			preHandler: [requireRole(["admin"])],
			schema: {
				body: {
					type: "object",
					required: ["documentId", "clientId"],
					properties: {
						documentId: { type: "string", format: "uuid" },
						clientId: { type: "string", format: "uuid" },
					},
					additionalProperties: false,
				},
			},
		},
		async (request, reply) => {
			try {
				const { documentId, clientId } = request.body as {
					documentId: string;
					clientId: string;
				};

				const deleted = await fastify.db
					.delete(documentAssignments)
					.where(
						and(
							eq(documentAssignments.documentId, documentId),
							eq(documentAssignments.clientId, clientId),
						),
					)
					.returning();

				if (deleted.length === 0) {
					throw new ApiError("Assignment not found", 404, "ASSIGNMENT_NOT_FOUND");
				}

				return reply.success({ deleted: true }, "Client unassigned successfully", 200);
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
	);

	fastify.delete(
		"/document/:id",
		{
			preHandler: [requireRole(["admin"])],
			schema: {
				params: {
					type: "object",
					required: ["id"],
					properties: {
						id: { type: "string", format: "uuid" },
					},
					additionalProperties: false,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params as { id: string };
			let driveFileId: string | null = null;

			const result = await fastify.db.transaction(async (tx) => {
				const [document] = await tx
					.select({ fileId: documents.fileId })
					.from(documents)
					.where(eq(documents.id, id))
					.limit(1);

				if (!document) {
					throw new ApiError("Document not found", 404, "DOCUMENT_NOT_FOUND");
				}

				driveFileId = document.fileId;

				const assignments = await tx
					.select({ count: count() })
					.from(documentAssignments)
					.where(eq(documentAssignments.documentId, id));

				if (assignments[0].count > 0) {
					throw new ApiError(
						"Cannot delete document. Remove all client assignments first.",
						400,
						"DOCUMENT_HAS_ASSIGNMENTS",
					);
				}

				await tx.delete(qrCodes).where(eq(qrCodes.documentId, id));

				await tx.delete(documents).where(eq(documents.id, id));

				if (driveFileId) {
					await googleDriveService.deleteFile(driveFileId);
				}

				return { success: true };
			});

			return reply.success(result, "Document deleted successfully", 200);
		},
	);
}
