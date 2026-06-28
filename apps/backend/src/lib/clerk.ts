import { createClerkClient as _createClerkClient, verifyToken, type ClerkClient } from "@clerk/backend";
import type { FastifyRequest } from "fastify";
import { ApiError } from "~/utils/ApiError";

export function createClerkClient(key: string): ClerkClient {
	if (!key) {
		throw new ApiError("CLERK_SECRET_KEY is not provided", 500, "INTERNAL_SERVER_ERROR");
	}

	let clerkClient = _createClerkClient({
		secretKey: key,
	});

	console.log("✅ Clerk client initialized");

	return clerkClient;
}

export const clerkAuthMiddleware = async (request: FastifyRequest) => {
	try {
		const authHeader = request.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			throw new ApiError("No token provided", 401, "UNAUTHORIZED");
		}

		const token = authHeader.split(" ")[1];
		console.log("process.env.CLERK_JWT_KEY:: ", process.env.CLERK_JWT_KEY);

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
		throw new ApiError("Invalid or expired token", 401, "UNAUTHORIZED");
	}
};
