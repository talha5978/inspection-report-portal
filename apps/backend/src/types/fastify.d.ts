import "fastify";
import type { ClerkClient } from "@clerk/backend";
import type { DbClient, UserRole } from "@inspection-report-portal/db";

declare module "fastify" {
	interface FastifyInstance {
		db: DbClient;
		clerk: ClerkClient;
	}

	interface FastifyRequest {
		user?: {
			id: string;
			email: string;
			role?: UserRole;
		};
	}

	interface FastifyReply {
		success<D>(data: D, message?: string, statusCode?: number): FastifyReply;
	}
}
