import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { assignDocument } from "~/api/documents";
import { getClients } from "~/api/auth";
import { getToken } from "@clerk/react-router";
import type { AssignDocResponse } from "~/types/documents";
import type { ErrorResponse, SuccessResponse } from "~/types/response";
import type { ClientsListResponse } from "~/types/clients";

interface AssignClientsDialogProps {
	documentId: string;
	documentTitle: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: (open?: boolean) => void;
	onCancel?: () => void;
}

export default function AssignClientsDialog({
	documentId,
	documentTitle,
	open,
	onOpenChange,
	onSuccess,
	onCancel,
}: AssignClientsDialogProps) {
	const [clients, setClients] = useState<ClientsListResponse["clients"]>([]);
	const [selectedClients, setSelectedClients] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize] = useState(12);
	const [total, setTotal] = useState(0);

	useEffect(() => {
		if (open) {
			fetchClients(pageIndex);
		}
	}, [open, pageIndex]);

	const fetchClients = async (page: number) => {
		setIsLoading(true);
		try {
			const token = await getToken();
			const result = await getClients(token!, {
				pageIndex: page,
				pageSize,
			});

			if (result.success) {
				const data = (result as SuccessResponse<ClientsListResponse>).data;
				setClients(data.clients);
				setTotal(data.pagination.total);
			}
		} catch (error) {
			toast.error("Failed to load clients");
		} finally {
			setIsLoading(false);
		}
	};

	const toggleClient = (clientId: string) => {
		if (selectedClients.includes(clientId)) {
			setSelectedClients(selectedClients.filter((id) => id !== clientId));
		} else {
			setSelectedClients([...selectedClients, clientId]);
		}
	};

	const handleAssign = async () => {
		if (selectedClients.length === 0) {
			toast.error("Please select at least one client");
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();
			const result = await assignDocument(token!, documentId, selectedClients);

			if (result.success) {
				toast.success(
					`Assigned to ${(result as SuccessResponse<AssignDocResponse>).data.assignedCount} clients successfully`,
				);
				onSuccess?.(false);
				onOpenChange(false);
				setSelectedClients([]);
				setPageIndex(0);
			} else {
				toast.error((result as ErrorResponse).error?.message || "Failed to assign clients");
			}
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setIsSubmitting(false);
		}
	};

	const pageCount = Math.ceil(total / pageSize);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Assign Document</DialogTitle>
					<DialogDescription>
						Select clients to assign <strong>"{documentTitle}"</strong>
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-auto py-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="animate-spin" />
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{clients.map((client) => (
								<div
									key={client.id}
									onClick={() => toggleClient(client.id)}
									className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${
										selectedClients.includes(client.id)
											? "border-primary bg-primary/5"
											: "border-muted"
									}`}
								>
									<div className="flex items-start justify-between">
										<div>
											<p className="font-medium">{client.name}</p>
											<p className="text-sm text-muted-foreground">{client.email}</p>
										</div>
										{selectedClients.includes(client.id) && (
											<Check className="w-5 h-5 text-primary" />
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-between border-t pt-4">
					<div className="text-sm text-muted-foreground">
						Showing {clients.length} of {total} clients
					</div>

					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
							disabled={pageIndex === 0}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>

						<Button
							variant="outline"
							size="sm"
							onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
							disabled={pageIndex >= pageCount - 1}
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<DialogFooter className="flex gap-3">
					<Button
						variant="outline"
						onClick={() => {
							if (onCancel) onCancel();
							onOpenChange(false);
						}}
					>
						Cancel
					</Button>
					<Button onClick={handleAssign} disabled={isSubmitting || selectedClients.length === 0}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Assign to {selectedClients.length} Client{selectedClients.length !== 1 ? "s" : ""}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
