import { API_URL } from "~/lib/fetch.config";
import type { ApiResponse } from "~/types/response";

const ROUTE_BASE = `${API_URL}/qrcodes`;

export async function getDocumentByQR(shortCode: string): ApiResponse<{ fileUrl: string }> {
	const res = await fetch(`${ROUTE_BASE}/view/${shortCode}`, {
		method: "GET",
	});

	const data = await res.json();
	return data;
}
