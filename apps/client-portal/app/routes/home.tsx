import { SignOutButton } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/server";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { LogOut, Search } from "lucide-react";
import {
	Form,
	type LoaderFunctionArgs,
	redirect,
	useLoaderData,
	useLocation,
	useNavigation,
} from "react-router";
import { getDocumentList } from "~/api/documents";
import { DataTable, DataTableSkeleton, TableColumnsToggle } from "~/components/Table/data-table";
import { Button } from "~/components/ui/button";
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

	const { q, pageIndex } = getPaginationQueryPayload({
		request: args.request,
	});

	const data = await getDocumentList(token, { pageIndex, search: q });

	if (!data.success) {
		throw new Error((data as ErrorResponse).error.message ?? "Something went wrong");
	}

	return {
		data: (data as SuccessResponse<DocumentListResponse>).data as DocumentListResponse,
		query: q,
		pageIndex,
	};
};

const pageSize = 20;

export default function DocumentsPage() {
	const loaderData = useLoaderData<typeof loader>();
	const { data, query, pageIndex } = loaderData;
	const navigation = useNavigation();
	const location = useLocation();

	const pageCount = Math.ceil(data.pagination.total / pageSize);
	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const tableColumns: ColumnDef<DocumentListResponse["documents"][number]>[] = [
		{
			id: "Sr. No",
			accessorKey: "Sr. No",
			header: "Sr. No",
			cell: ({ row }) => <span>{row.index + 1}</span>,
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
			id: "Assigned At",
			accessorKey: "Assigned At",
			header: "Assigned At",
			cell: ({ row }) => {
				const date = new Date(row.original.createdAt);
				return date.toLocaleDateString();
			},
		},
		{
			id: "Actions",
			accessorKey: "",
			accessorFn: undefined,
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
		<div className="flex-1 flex flex-col gap-6">
			<div className="flex justify-end">
				<SignOutButton>
					<Button variant={"destructive"}>
						<LogOut />
						Sign Out
					</Button>
				</SignOutButton>
			</div>
			<div className="flex items-center justify-between flex-wrap gap-2">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">My Documents</h1>
					<p className="text-muted-foreground">Inspect your assigned documents</p>
				</div>
			</div>

			{query && <p className="text-sm text-muted-foreground">Showing results for "{query}"</p>}

			<div className="space-y-4">
				<div className="flex gap-2 justify-between items-center">
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
	);
}
