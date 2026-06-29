import type { UserRole } from "@inspection-report-portal/db";
import type { FastifyRequest } from "fastify";
import { ApiError } from "~/utils/ApiError";

export const requireRole = (allowedRoles: UserRole[]) => {
	return async (request: FastifyRequest) => {
		if (!request.user) {
			throw new ApiError("Authentication required", 401, "UNAUTHORIZED");
		}

		if (!request.user.role) {
			throw new ApiError("User role not found", 500, "INTERNAL_SERVER_ERROR");
		}

		if (!allowedRoles.includes(request.user.role)) {
			throw new ApiError("Insufficient permissions.", 403, "FORBIDDEN");
		}
	};
};
