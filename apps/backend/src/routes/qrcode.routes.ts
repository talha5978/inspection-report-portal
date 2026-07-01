import { documents, qrCodes, users } from "@inspection-report-portal/db";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { requireRole } from "~/middlewares/roleGaurd";
import { ApiError } from "~/utils/ApiError";

export async function qrCodeRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/create",
		{
			preHandler: [requireRole(["admin"])],
			schema: {
				body: {
					type: "object",
					required: ["documentId"],
					properties: {
						documentId: { type: "string", format: "uuid" },
						equipmentName: { type: "string" },
						equipmentLocation: { type: "string" },
					},
					additionalProperties: false,
				},
			},
		},
		async (request, reply) => {
			try {
				const { documentId, equipmentName, equipmentLocation } = request.body as {
					documentId: string;
					equipmentName?: string;
					equipmentLocation?: string;
				};

				// Verify document exists
				const [document] = await fastify.db
					.select({ id: documents.id })
					.from(documents)
					.where(eq(documents.id, documentId))
					.limit(1);

				if (!document) {
					throw new ApiError("Document not found", 404, "DOCUMENT_NOT_FOUND");
				}

				// Check if the qr-code has already been generated
				const [existingQrCode] = await fastify.db
					.select()
					.from(qrCodes)
					.where(eq(qrCodes.documentId, documentId))
					.limit(1);

				if (existingQrCode) {
					return reply.success(existingQrCode, "QR Code already exists", 200);
				}

				const [user] = await fastify.db
					.select({ id: users.id })
					.from(users)
					.where(eq(users.authId, request.user!.id))
					.limit(1);

				if (!user) {
					throw new ApiError("Local user not found", 404, "USER_NOT_FOUND");
				}

				const shortCode = Math.random().toString(36).substring(2, 13);

				const [newQrCode] = await fastify.db
					.insert(qrCodes)
					.values({
						documentId,
						shortCode,
						equipmentName: equipmentName?.trim(),
						equipmentLocation: equipmentLocation?.trim(),
						createdBy: user.id,
					})
					.returning();

				return reply.success(newQrCode, "QR Code data saved successfully", 201);
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
	);

	fastify.get(
		"/view/:shortCode",
		{
			schema: {
				params: {
					type: "object",
					required: ["shortCode"],
					properties: {
						shortCode: { type: "string" },
					},
					additionalProperties: false,
				},
			},
		},
		async (request, reply) => {
			const { shortCode } = request.params as { shortCode: string };

			const [result] = await fastify.db
				.select({
					fileUrl: documents.fileUrl,
				})
				.from(qrCodes)
				.innerJoin(documents, eq(qrCodes.documentId, documents.id))
				.where(eq(qrCodes.shortCode, shortCode))
				.limit(1);

			if (!result) {
				throw new ApiError("QR Code not found or invalid", 404, "QR_NOT_FOUND");
			}

			return reply.success({ fileUrl: result.fileUrl }, "Document retrieved successfully", 200);
		},
	);
}
