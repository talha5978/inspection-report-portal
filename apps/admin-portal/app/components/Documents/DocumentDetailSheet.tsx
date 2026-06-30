import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Loader2, ExternalLink, Users } from "lucide-react";
import { getToken } from "@clerk/react-router";
import { getDocumentDetail } from "~/api/documents";
import { toast } from "sonner";
import type { DocumentDetail } from "~/types/documents";
import type { SuccessResponse } from "~/types/response";
import AssignClientsDialog from "~/components/Documents/AssignClientsDialog";
import { useRevalidator } from "react-router";

interface DocumentDetailSheetProps {
	documentId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function DocumentDetailSheet({ documentId, open, onOpenChange }: DocumentDetailSheetProps) {
	const revalidator = useRevalidator();
	const [document, setDocument] = useState<DocumentDetail["document"] | null>(null);
	const [assignedClients, setAssignedClients] = useState<DocumentDetail["assignedClients"]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [pageSize, setPageSize] = useState(20);
	const [assignDialogState, setAssignDialog] = useState<{
		open: boolean;
		documentId: string;
		documentTitle: string;
	} | null>(null);

	const fetchDocumentDetail = async (size = pageSize) => {
		setIsLoading(true);
		try {
			const token = await getToken();
			const result = await getDocumentDetail(token!, documentId, size);

			if (result.success) {
				setDocument((result as SuccessResponse<DocumentDetail>).data.document);
				setAssignedClients((result as SuccessResponse<DocumentDetail>).data.assignedClients);
			}
		} catch (error) {
			toast.error("Failed to load document details");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (open && documentId) {
			fetchDocumentDetail();
		}
	}, [open, documentId]);

	const handleLoadMore = () => {
		const newSize = pageSize + 20;
		setPageSize(newSize);
		fetchDocumentDetail(newSize);
	};

	return (
		<>
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="w-full sm:max-w-xl overflow-y-auto">
					<SheetHeader className="pb-6 border-b">
						<SheetTitle>Document Details</SheetTitle>
						<SheetDescription>View document and assigned clients</SheetDescription>
					</SheetHeader>

					{isLoading ? (
						<div className="flex items-center justify-center py-20">
							<Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
						</div>
					) : document ? (
						<div className="py-2 px-4 space-y-10">
							{/* Document Info */}
							<div className="space-y-4">
								<div>
									<h2 className="text-xl font-semibold tracking-tight">{document.title}</h2>

									<div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
										<a
											href={document.fileUrl}
											target="_blank"
											rel="noreferrer"
											className="flex items-center gap-1.5 font-medium text-primary hover:underline"
										>
											<ExternalLink className="w-4 h-4" />
											{document.fileName}
										</a>
										<span className="text-muted-foreground border-l pl-4">
											Uploaded on {new Date(document.createdAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>

							{/* Assigned Clients */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<Users className="w-4 h-4" />
										Assigned Clients
									</h3>
									<Badge variant="secondary" className="rounded-full px-2.5 font-mono">
										{document.assignedClients}
									</Badge>
								</div>

								<div className="grid gap-2">
									{assignedClients.length > 0 ? (
										assignedClients.map((client) => (
											<div
												key={client.id}
												className="flex justify-between items-center p-3 rounded-md border bg-background hover:bg-muted/40 transition-colors"
											>
												<div className="grid gap-0.5">
													<p className="text-sm font-medium leading-none">
														{client.name}
													</p>
													<p className="text-sm text-muted-foreground">
														{client.email}
													</p>
												</div>
												{!client.isActive && (
													<Badge className="capitalize" variant={"destructive"}>
														{"Access Revoked"}
													</Badge>
												)}
											</div>
										))
									) : (
										<div className=" text-center py-6 border rounded-md border-dashed">
											<p className="text-sm text-muted-foreground">
												No clients assigned yet
											</p>
											<Button
												variant={"link"}
												onClick={() =>
													setAssignDialog({
														open: true,
														documentId,
														documentTitle: document.title,
													})
												}
											>
												Assign Now
											</Button>
										</div>
									)}
								</div>

								{/* Load More Button */}
								{document.assignedClients > assignedClients.length && (
									<div className="pt-2">
										<Button
											variant="secondary"
											className="w-full"
											onClick={handleLoadMore}
											disabled={isLoading}
										>
											{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
											Load More
										</Button>
									</div>
								)}
							</div>
						</div>
					) : null}
				</SheetContent>
			</Sheet>
			{assignDialogState && (
				<AssignClientsDialog
					documentId={assignDialogState?.documentId}
					documentTitle={assignDialogState?.documentTitle}
					open={assignDialogState?.open}
					onOpenChange={(open) => setAssignDialog({ open, documentId: "", documentTitle: "" })}
					onSuccess={(open) => {
						setAssignDialog({ open: open ?? false, documentId: "", documentTitle: "" });
						revalidator.revalidate();
						fetchDocumentDetail();
					}}
				/>
			)}
		</>
	);
}
