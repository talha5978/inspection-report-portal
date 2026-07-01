import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getDocumentByQR } from "~/api/qr-codes";
import type { ErrorResponse, SuccessResponse } from "~/types/response";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const shortCode = params.shortCode;
	if (!shortCode) {
		throw new Response("QR short code is missing", { status: 400 });
	}

	const result = await getDocumentByQR(shortCode);

	if (result.success) {
		const fileUrl = (result as SuccessResponse<{ fileUrl: string }>).data.fileUrl;
		return redirect(fileUrl);
	} else {
		throw new Response((result as ErrorResponse).error.message ?? "Something went wrong", {
			status: 500,
		});
	}
};
