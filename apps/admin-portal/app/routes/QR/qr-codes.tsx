import { getAuth } from "@clerk/react-router/server";
import { PlusCircle, Search, Download, Printer } from "lucide-react";
import {
	Form,
	Link,
	type LoaderFunctionArgs,
	redirect,
	useLoaderData,
	useLocation,
	useNavigation,
} from "react-router";
import { getQrCodeList } from "~/api/qr-codes";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { QrCodesListResponse } from "~/types/qrcodes";
import type { ErrorResponse, SuccessResponse } from "~/types/response";
import { getPaginationQueryPayload } from "~/utils/PaginationQueryPayload";
import QRCode from "qrcode";
import { toast } from "sonner";

export const meta = () => {
	return [{ title: "QR Codes" }, { name: "description", content: "All QR Codes" }];
};

export const loader = async (args: LoaderFunctionArgs) => {
	const { getToken } = await getAuth(args);
	const token = await getToken();

	if (!token) {
		return redirect("/sign-in");
	}

	const { q, pageIndex } = getPaginationQueryPayload({
		request: args.request,
	});

	const data = await getQrCodeList(token, { pageIndex, search: q });

	if (!data.success) {
		throw new Error((data as ErrorResponse).error.message ?? "Something went wrong");
	}

	return {
		data: (data as SuccessResponse<QrCodesListResponse>).data as QrCodesListResponse,
		query: q,
		pageIndex,
	};
};

const pageSize = 12;

export default function QrCodesPage() {
	const loaderData = useLoaderData<typeof loader>();
	const { data, query, pageIndex } = loaderData;
	const navigation = useNavigation();
	const location = useLocation();

	const pageCount = Math.ceil(data.pagination.total / pageSize);
	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const genQr = async (shortCode: string) => {
		const qrUrl = `${process.env.CLIENT_PORTAL_URL}/view/${shortCode}`;
		const qrDataUrl = await QRCode.toDataURL(qrUrl, {
			width: 300,
			margin: 1,
			errorCorrectionLevel: "H",
		});
		return qrDataUrl;
	};

	const handlePrintQR = async (shortCode: string) => {
		const qrDataUrl = await genQr(shortCode);

		const printWindow = window.open("", "_blank");
		if (printWindow) {
			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
					<head>
						<style>
							@page { size: auto; margin: 0.5in; }
							body { 
								display: flex; 
								flex-direction: column; 
								justify-content: center; 
								align-items: center; 
								height: 100vh; 
								margin: 0; 
								font-family: Arial, sans-serif;
							}
							img { 
								width: 260px; 
								height: 260px; 
								image-rendering: crisp-edges;
							}
							.info { 
								text-align: center; 
								margin-top: 30px; 
							}
						</style>
					</head>
					<body>
                        <img src="${qrDataUrl}" />
						<script>
							window.onload = function() {
								window.print();
								setTimeout(() => window.close(), 800);
							};
						</script>
					</body>
				</html>
			`);
			printWindow.document.close();
		}
	};

	const handleDownloadQR = async (shortCode: string) => {
		try {
			const qrDataUrl = await genQr(shortCode);

			const link = document.createElement("a");
			link.href = qrDataUrl;
			link.download = `QR-${shortCode}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toast.success("QR Code downloaded");
		} catch (error) {
			toast.error("Failed to download QR Code");
		}
	};

	return (
		<div className="flex-1 flex flex-col gap-6">
			<div className="flex items-center justify-between flex-wrap gap-2">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">QR Codes</h1>
					<p className="text-muted-foreground">Manage equipment QR codes</p>
				</div>

				<Link to="/documents" className="ml-auto inline" prefetch="intent">
					<Button>
						<PlusCircle className="mr-2 h-4 w-4" />
						Generate New QR
					</Button>
				</Link>
			</div>

			{query && <p className="text-sm text-muted-foreground">Showing results for "{query}"</p>}

			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<Form method="get" className="max-w-sm">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								placeholder="Search QR codes..."
								name="q"
								defaultValue={query}
								className="pl-10"
							/>
						</div>
					</Form>
				</div>

				{isFetching ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{data.qrCodes.map((qr) => (
							<div
								key={qr.id}
								className="border rounded-2xl p-5 bg-card hover:shadow-xs transition-all group w-full"
							>
								<div className="flex justify-center mb-5">
									<div className="bg-white p-3 rounded-xl shadow-sm border">
										<img
											src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
												`${window.location.origin}/view/${qr.shortCode}`,
											)}`}
											alt={`QR Code ${qr.shortCode}`}
											className="w-40 h-40"
										/>
									</div>
								</div>

								<div className="text-center mb-4">
									<div className="font-mono text-base font-semibold tracking-widest text-primary">
										{qr.shortCode}
									</div>
									<div className="text-sm text-muted-foreground mt-1 line-clamp-1">
										{qr.documentTitle}
									</div>
								</div>

								{(qr.equipmentName || qr.equipmentLocation) && (
									<div className="text-xs text-center text-muted-foreground mb-5 space-y-0.5">
										{qr.equipmentName && <div>{qr.equipmentName}</div>}
										{qr.equipmentLocation && <div>{qr.equipmentLocation}</div>}
									</div>
								)}

								<div className="flex justify-center gap-2">
									<Button
										variant="outline"
										size="sm"
										className="flex-1 h-9"
										onClick={() => handlePrintQR(qr.shortCode)}
									>
										<Printer className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1 h-9"
										onClick={() => handleDownloadQR(qr.shortCode)}
									>
										<Download className="w-4 h-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}

				<div className="flex justify-center gap-4 mt-8">
					<Button
						variant="outline"
						onClick={() => window.history.back()}
						disabled={pageIndex === 0}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						onClick={() => window.history.pushState({}, "", `?pageIndex=${pageIndex + 1}`)}
						disabled={pageIndex >= pageCount - 1}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
