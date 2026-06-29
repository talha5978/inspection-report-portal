import { documentAssignments, documents, users } from "@inspection-report-portal/db";
import { count, desc, eq, ilike, or } from "drizzle-orm";
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
}
