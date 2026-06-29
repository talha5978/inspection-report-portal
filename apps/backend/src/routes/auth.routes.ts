import { type FastifyInstance } from "fastify";
import { users, type User } from "@inspection-report-portal/db";
import { ApiError } from "~/utils/ApiError";
import { requireRole } from "~/middlewares/roleGaurd";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

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

	fastify.get(
		"/clients",
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

				const baseCondition = eq(users.role, "client");

				let whereCondition = baseCondition;

				if (searchTerm) {
					whereCondition = and(
						baseCondition,
						or(ilike(users.name, `%${searchTerm}%`), ilike(users.email, `%${searchTerm}%`)),
					)!;
				}

				const clients = await fastify.db
					.select({
						id: users.id,
						name: users.name,
						email: users.email,
						isActive: users.isActive,
						createdAt: users.createdAt,
					})
					.from(users)
					.where(whereCondition)
					.orderBy(desc(users.createdAt))
					.limit(limit)
					.offset(offset);

				const totalResult = await fastify.db
					.select({ count: count() })
					.from(users)
					.where(whereCondition);

				const total = totalResult[0].count;

				return reply.success({
					clients,
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
