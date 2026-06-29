import { type FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { users, type User } from "@inspection-report-portal/db";
import { getAuth } from "@clerk/fastify";
import { ApiError } from "~/utils/ApiError";
import { requireRole } from "~/middlewares/roleGaurd";

export async function authRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/create-client",
		{
			preHandler: [requireRole(["admin"])],
		},
		async (request, reply) => {
			const auth = getAuth(request);
			if (!auth.userId) {
				throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
			}

			const clerkUser = await fastify.clerk.users.getUser(auth.userId);

			if (!clerkUser) {
				throw new ApiError("Clerk user not found", 500, "INTERNAL_SERVER_ERROR");
			}

			const body = {
				authId: clerkUser.id,
				email: clerkUser.emailAddresses[0].emailAddress,
				name: clerkUser.fullName,
			};

			if (!body.authId) {
				throw new ApiError("Clerk user id is required", 400, "MISSING_CLERK_USER_ID");
			}

			if (!body.email) {
				throw new ApiError("Email is required", 400, "MISSING_EMAIL");
			}

			const existingUser = await fastify.db.query.users.findFirst({
				where: eq(users.authId, body.authId),
			});

			console.log(existingUser, body);

			if (existingUser) {
				return reply.success<User>(existingUser, "User synced successfully", 200);
			}

			const [createdUser] = await fastify.db
				.insert(users)
				.values({
					authId: body.authId,
					email: body.email,
					name: body.name ?? "",
					isActive: true,
					role: "client",
				})
				.returning();

			return reply.success<User>(createdUser, "User created successfully", 201);
		},
	);
}
