import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DownloadIcon, Loader2, Printer, QrCodeIcon } from "lucide-react";
import { toast } from "sonner";
import { createQrCode } from "~/api/qr-codes";
import QRCODE from "qrcode";
import { motion } from "motion/react";
import type { ErrorResponse, SuccessResponse } from "~/types/response";
import type { QrCode } from "@inspection-report-portal/db";
import { getToken } from "@clerk/react-router";

interface CreateQRDialogProps {
	documentId: string;
	documentTitle: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: (open?: boolean) => void;
}

export default function CreateQRDialog({
	documentId,
	documentTitle,
	open,
	onOpenChange,
	onSuccess,
}: CreateQRDialogProps) {
	const [equipmentName, setEquipmentName] = useState("");
	const [equipmentLocation, setEquipmentLocation] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [qrImage, setQrImage] = useState<string | null>(null);
	const [qrData, setQrData] = useState<SuccessResponse<QrCode>["data"] | null>(null);
	const handleGenerate = async () => {
		setIsGenerating(true);

		try {
			console.log("documentId: ", documentId);
			const token = await getToken();
			console.log("token: ", token);
			console.log(documentId, equipmentName || null, equipmentLocation || null);
			const result = await createQrCode(token!, {
				documentId,
				equipmentName: equipmentName.trim() || null,
				equipmentLocation: equipmentLocation.trim() || null,
			});

			if (result.success) {
				const shortCode = (result as SuccessResponse<QrCode>).data.shortCode;
				const qrUrl = `${window.location.origin}/view/${shortCode}`;

				const qrDataUrl = await QRCODE.toDataURL(qrUrl, {
					width: 300,
					margin: 1,
					errorCorrectionLevel: "H",
				});

				setQrImage(qrDataUrl);
				setQrData((result as SuccessResponse<QrCode>).data);

				toast.success(
					(result as SuccessResponse<QrCode>).message || "QR Code generated successfully",
				);
			} else {
				toast.error((result as ErrorResponse).error?.message || "Failed to generate QR Code");
			}
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDownload = () => {
		if (!qrImage) return;

		const link = document.createElement("a");
		link.href = qrImage;
		link.download = `QR-${qrData?.shortCode || "code"}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handlePrint = () => {
		if (!qrImage) return;

		const printWindow = window.open("", "_blank");
		if (printWindow) {
			let extraInfo = "";

			if (qrData?.equipmentName) {
				extraInfo += `<p><strong>${qrData.equipmentName}</strong></p>`;
			}
			if (qrData?.equipmentLocation) {
				extraInfo += `<p><strong>${qrData.equipmentLocation}</strong></p>`;
			}

			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
					<head>
						<title>QR Code - ${documentTitle}</title>
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
						<img src="${qrImage}" />
						<div class="info">
						<p><strong>${documentTitle}</strong></p>
							${extraInfo}
						<p>Scan to view document</p>
						</div>
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<QrCodeIcon className="w-5 h-5" />
						Generate QR Code
					</DialogTitle>
					<DialogDescription>
						<strong>{documentTitle}</strong>
					</DialogDescription>
				</DialogHeader>

				{!qrImage ? (
					<div className="space-y-4 py-4 [&>div]:space-y-2">
						<div>
							<Label>Equipment Name (Optional)</Label>
							<Input
								placeholder="Main Distribution Board"
								value={equipmentName}
								onChange={(e) => setEquipmentName(e.target.value)}
							/>
						</div>

						<div>
							<Label>Location (Optional)</Label>
							<Input
								placeholder="Ground Floor, Block A"
								value={equipmentLocation}
								onChange={(e) => setEquipmentLocation(e.target.value)}
							/>
						</div>

						<Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
							{isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Generate QR Code
						</Button>
					</div>
				) : (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex flex-col items-center py-6"
					>
						<div className="bg-white p-2 rounded-xl shadow-sm border mb-6">
							<img src={qrImage} alt="QR Code" className="w-48 h-48 mx-auto" />
						</div>

						<p className="text-sm text-muted-foreground mb-6 text-center">
							Scan this QR code to access the document
						</p>

						<div className="flex gap-3 w-full justify-center">
							<Button variant="outline" className="flex-1" onClick={handleDownload}>
								<DownloadIcon className="w-4 h-4" />
								Download
							</Button>
							<Button variant="outline" className="flex-1" onClick={handlePrint}>
								<Printer className="w-4 h-4" />
								Print
							</Button>
							<Button className="flex-1" onClick={() => onSuccess?.()}>
								Done
							</Button>
						</div>
					</motion.div>
				)}
			</DialogContent>
		</Dialog>
	);
}
