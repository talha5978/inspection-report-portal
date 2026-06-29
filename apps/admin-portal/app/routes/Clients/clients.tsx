import { getAuth } from "@clerk/react-router/server";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, Search, Eye, Trash2, X, Check } from "lucide-react";
import {
	Form,
	Link,
	type LoaderFunctionArgs,
	redirect,
	useLoaderData,
	useLocation,
	useNavigation,
} from "react-router";
import { getClients } from "~/api/auth";
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
import type { ClientsListResponse } from "~/types/clients";
import type { ErrorResponse, SuccessResponse } from "~/types/response";
import { GetPaginationControls } from "~/utils/PaginationControls";
import { getPaginationQueryPayload } from "~/utils/PaginationQueryPayload";

export const meta = () => {
	return [{ title: "Clients" }, { name: "description", content: "All Clients" }];
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

	const data = await getClients(token, { pageIndex, pageSize, search: q });

	if (!data.success) {
		throw new Error((data as ErrorResponse).error.message ?? "Something went wrong");
	}

	return {
		data: (data as SuccessResponse<ClientsListResponse>).data as ClientsListResponse,
		query: q,
		pageIndex,
		pageSize,
	};
};

export default function ClientsPage() {
	const loaderData = useLoaderData<typeof loader>();
	const { data, query, pageIndex, pageSize } = loaderData;
	const navigation = useNavigation();
	const location = useLocation();

	const pageCount = Math.ceil(data.pagination.total / pageSize);
	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const tableColumns: ColumnDef<ClientsListResponse["clients"][number]>[] = [
		{
			id: "ID",
			accessorKey: "ID",
			header: "ID",
			cell: ({ row }) => <TableCopyField id={row.original.id} message="ID Copied" />,
		},
		{
			id: "Name",
			accessorKey: "Name",
			header: "Name",
			cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
		},
		{
			id: "Email",
			accessorKey: "Email",
			header: "Email",
			cell: ({ row }) => <div>{row.original.email}</div>,
		},
		{
			id: "Status",
			accessorKey: "Status",
			header: "Status",
			cell: ({ row }) => (
				<Badge variant={row.original.isActive ? "success" : "destructive"}>
					{row.original.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
					{row.original.isActive ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			id: "Created At",
			accessorKey: "Created At",
			header: "Created At",
			cell: ({ row }) => {
				const date = new Date(row.original.createdAt);
				return date.toLocaleDateString();
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const client = row.original;

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
								<Link to={`/clients/${client.id}`} prefetch="intent">
									<Eye className="h-4 w-4" />
									View
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem className="text-destructive">
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
		data: data.clients ?? [],
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
			<div className="flex items-center justify-between flex-wrap gap-2">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
					<p className="text-muted-foreground">Manage client accounts</p>
				</div>

				<Link to="/clients/new" prefetch="intent">
					<Button>
						<PlusCircle className="mr-2 h-4 w-4" />
						New Client
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
								placeholder="Search clients..."
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
