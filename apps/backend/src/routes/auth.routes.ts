import { type FastifyInstance } from "fastify";
import { users, type User } from "@inspection-report-portal/db";
import { ApiError } from "~/utils/ApiError";
import { requireRole } from "~/middlewares/roleGaurd";

export async function authRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/create-client",
		{
			preHandler: [requireRole(["admin"])],
			schema: {
				body: {
					type: "object",
					required: ["email", "password", "firstName", "lastName"],
					properties: {
						email: {
							type: "string",
							format: "email",
						},
						password: {
							type: "string",
							minLength: 8,
						},
						firstName: {
							type: "string",
							minLength: 1,
						},
						lastName: {
							type: "string",
							minLength: 1,
						},
					},
					additionalProperties: false,
				},
			},
		},
		async (request, reply) => {
			const input = request.body as {
				email: string;
				password: string;
				firstName: string;
				lastName: string;
			};

			for (const key in input) {
				input[key as keyof typeof input] = input[key as keyof typeof input].trim();
			}

			const createdUser = await fastify.clerk.users.createUser({
				firstName: input.firstName,
				lastName: input.lastName,
				emailAddress: [input.email.toLowerCase()],
				username: input.email.split("@")[0].toLowerCase(),
				password: input.password,
				publicMetadata: { role: "client" },
				privateMetadata: { role: "client" },
			});

			if (!createdUser) {
				throw new ApiError("Clerk user not found", 500, "MISSING_USER");
			}

			const [dbUser] = await fastify.db
				.insert(users)
				.values({
					authId: createdUser.id,
					email: input.email.toLowerCase(),
					name: input.firstName + " " + input.lastName,
					isActive: true,
					role: "client",
				})
				.returning();

			return reply.success<User>(dbUser, "User created successfully", 201);
		},
	);
}
