import type { FastifyInstance } from "fastify";

export async function documentRoutes(fastify: FastifyInstance) {
	fastify.get("/create", async (request, reply) => {
		return reply.success(request.user, "Success", 200);
	});
}
