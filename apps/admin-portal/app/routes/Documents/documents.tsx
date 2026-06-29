import { getAuth } from "@clerk/react-router/server";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, Search, Eye, Trash2, Check, Users, UserCheck } from "lucide-react";
import { useState } from "react";
import {
	Form,
	Link,
	type LoaderFunctionArgs,
	redirect,
	useLoaderData,
	useLocation,
	useNavigation,
	useRevalidator,
} from "react-router";
import { getDocumentList } from "~/api/documents";
import AssignClientsDialog from "~/components/Documents/AssignClientsDialog";
import { DataTable, DataTableSkeleton, TableColumnsToggle } from "~/components/Table/data-table";
import TableCopyField from "~/components/Table/TableId";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import type { DocumentListResponse } from "~/types/documents";
import type { ErrorResponse, SuccessResponse } from "~/types/response";
import { GetPaginationControls } from "~/utils/PaginationControls";
import { getPaginationQueryPayload } from "~/utils/PaginationQueryPayload";

export const meta = () => {
	return [{ title: "Documents" }, { name: "description", content: "All Documents" }];
};

export const loader = async (args: LoaderFunctionArgs) => {
	const { getToken } = await getAuth(args);
	const token = await getToken();

	if (!token) {
		return redirect("/sign-in");
	}

	const { q, pageIndex, pageSize } = getPaginationQueryPayload({
		request: args.request,
	});

	const data = await getDocumentList(token, { pageIndex, pageSize, search: q });

	if (!data.success) {
		throw new Error((data as ErrorResponse).error.message ?? "Something went wrong");
	}

	return {
		data: (data as SuccessResponse<DocumentListResponse>).data as DocumentListResponse,
		query: q,
		pageIndex,
		pageSize,
	};
};

export default function DocumentsPage() {
	const loaderData = useLoaderData<typeof loader>();
	const revalidator = useRevalidator();
	const { data, query, pageIndex, pageSize } = loaderData;
	const navigation = useNavigation();
	const location = useLocation();
	const [assignDialogState, setAssignDialog] = useState<{
		open: boolean;
		documentId: string;
		documentTitle: string;
	} | null>(null);

	const pageCount = Math.ceil(data.pagination.total / pageSize);
	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const tableColumns: ColumnDef<DocumentListResponse["documents"][number]>[] = [
		{
			id: "ID",
			accessorKey: "ID",
			header: "ID",
			cell: ({ row }) => <TableCopyField id={row.original.id} message="ID Copied" />,
		},
		{
			id: "Title",
			accessorKey: "Title",
			header: "Title",
			cell: ({ row }) => <div>{row.original.title}</div>,
		},
		{
			id: "File",
			accessorKey: "File",
			header: "File",
			cell: ({ row }) => (
				<div className="hover:text-primary hover:underline underline-offset-8 cursor-pointer">
					<a href={row.original.fileUrl} target="_blank">
						{row.original.fileName}
					</a>
				</div>
			),
		},
		{
			id: "Assigned Clients",
			accessorKey: "Assigned Clients",
			header: "Assigned Clients",
			cell: ({ row }) => {
				const count = row.original.assignedClients;
				return (
					<Badge
						variant={count > 0 ? "success" : "destructive"}
						className="flex items-center gap-1.5 px-3 py-1"
					>
						{count > 0 ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />}
						<span>{count} Assigned</span>
					</Badge>
				);
			},
		},
		{
			id: "Uploaded At",
			accessorKey: "Uploaded At",
			header: "Uploaded At",
			cell: ({ row }) => {
				const date = new Date(row.original.createdAt);
				return date.toLocaleDateString();
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const doc = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link to={`/documents/${doc.id}`} prefetch="intent">
									<Eye className="h-4 w-4" />
									View
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() =>
									setAssignDialog({
										open: true,
										documentId: doc.id,
										documentTitle: doc.title,
									})
								}
							>
								<UserCheck className="h-4 w-4" />
								Assign
							</DropdownMenuItem>
							<DropdownMenuItem variant="destructive">
								<Trash2 className="h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const { onPageChange, onPageSizeChange } = GetPaginationControls({});

	const table = useReactTable({
		data: data.documents ?? [],
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount,
		state: {
			pagination: {
				pageIndex,
				pageSize,
			},
		},
	});

	return (
		<>
			<div className="flex-1 flex flex-col gap-6">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
						<p className="text-muted-foreground">Manage inspection reports</p>
					</div>

					<Link to="/documents/new" className="ml-auto inline" prefetch="intent">
						<Button>
							<PlusCircle className="mr-2 h-4 w-4" />
							New Document
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
									placeholder="Search documents..."
									name="q"
									defaultValue={query}
									className="pl-10"
								/>
							</div>
						</Form>

						<TableColumnsToggle table={table} />
					</div>

					{isFetching ? (
						<DataTableSkeleton noOfSkeletons={5} columns={tableColumns} />
					) : (
						<DataTable
							table={table}
							onPageChange={onPageChange}
							onPageSizeChange={onPageSizeChange}
							pageSize={pageSize}
							total={data.pagination.total}
						/>
					)}
				</div>
			</div>
			{assignDialogState && (
				<AssignClientsDialog
					documentId={assignDialogState?.documentId}
					documentTitle={assignDialogState?.documentTitle}
					open={assignDialogState?.open}
					onOpenChange={(open) => setAssignDialog({ open, documentId: "", documentTitle: "" })}
					onSuccess={(open) => {
						setAssignDialog({ open: open ?? false, documentId: "", documentTitle: "" });
						revalidator.revalidate();
					}}
				/>
			)}
		</>
	);
}
