import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "~/components/ui/sidebar";
import { NavMain } from "~/components/Nav/nav-main";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
			className="min-h-0 h-full"
		>
			<Sidebar collapsible="icon" variant="sidebar">
				<SidebarContent className="my-2">
					<NavMain />
				</SidebarContent>
				<SidebarFooter className="mt-6 sm:hidden">
					<SidebarTrigger className="-ml-1 cursor-pointer" />
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<section className="@container/main sm:p-6 p-4">{children}</section>
			</SidebarInset>
		</SidebarProvider>
	);
}
