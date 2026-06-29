import { createClerkClient as _createClerkClient, type ClerkClient } from "@clerk/backend";
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
