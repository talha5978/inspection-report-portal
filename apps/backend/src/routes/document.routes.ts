import { documents, users } from "@inspection-report-portal/db";
import { eq } from "drizzle-orm";
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
}
