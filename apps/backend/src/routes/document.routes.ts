import { documents } from "@inspection-report-portal/db";
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
			const data = await request.file();

			if (!data) {
				throw new ApiError("No file uploaded", 400, "NO_FILE_UPLOADED");
			}

			const driveFile = await googleDriveService.uploadPDF(data.file, data.filename);
			await googleDriveService.makeFilePublic(driveFile.id);

			const { title } = request.body as { title?: string };

			const [newDocument] = await fastify.db
				.insert(documents)
				.values({
					title: title?.trim() ?? driveFile.name,
					fileName: driveFile.name,
					fileUrl: driveFile.webViewLink,
					fileId: driveFile.id,
					uploadedBy: request.user?.id,
				})
				.returning();

			return reply.success(
				{
					document: newDocument,
				},
				"Document uploaded successfully",
				201,
			);
		},
	);
}
