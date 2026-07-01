import { createClerkClient as _createClerkClient, verifyToken } from "@clerk/backend";
import type { FastifyRequest } from "fastify";
import { ApiError } from "~/utils/ApiError";

export const clerkAuthMiddleware = async (request: FastifyRequest) => {
	try {
		const authHeader = request.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			throw new ApiError("No token provided", 401, "UNAUTHORIZED");
		}

		const token = authHeader.split(" ")[1];

		const claims = await verifyToken(token, {
			jwtKey: process.env.CLERK_JWT_KEY,
			authorizedParties: [process.env.ADMIN_PORTAL_URL!, process.env.CLIENT_PORTAL_URL!],
		});

		request.user = {
			id: claims.sub,
			email: claims.email as string,
			role: (claims as any).role || "client",
		};
	} catch (err) {
		console.error("Clerk auth error:", err);
	}
};
