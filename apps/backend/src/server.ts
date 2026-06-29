import type { FastifyInstance } from "fastify";
import errorHandlerPlugin from "~/plugins/error-handler";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import { connectDB } from "@inspection-report-portal/db";
import { createClerkClient } from "~/lib/clerk";
import { clerkPlugin } from "@clerk/fastify";
import { authRoutes } from "~/routes/auth.routes";
import { documentRoutes } from "~/routes/document.routes";
import multipart from "@fastify/multipart";
import { clerkAuthMiddleware } from "~/middlewares/clerk";

export async function server(fastify: FastifyInstance) {
	await fastify.register(errorHandlerPlugin);

	await fastify.register(fastifyCors, {
		origin: [process.env.ADMIN_PORTAL_URL!, process.env.CLIENT_PORTAL_URL!],
		credentials: true,
	});

	await fastify.register(fastifyCookie);

	const dbConnection = await connectDB(process.env.PG_CONNECTION_STRING!);
	fastify.decorate("db", dbConnection.db);

	const clerkClient = createClerkClient(process.env.CLERK_SECRET_KEY!);
	fastify.decorate("clerk", clerkClient);

	await fastify.register(clerkPlugin, {
		secretKey: process.env.CLERK_SECRET_KEY!,
		publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY!,
	});

	fastify.addHook("onRequest", async (request, _reply) => {
		if (request.url.startsWith("/api")) {
			await clerkAuthMiddleware(request);
		}
	});

	fastify.register(multipart, {
		limits: {
			fileSize: 50 * 1024 * 1024,
			files: 1,
		},
	});

	await fastify.register(authRoutes, { prefix: "/api/auth" });
	await fastify.register(documentRoutes, { prefix: "/api/documents" });
}
