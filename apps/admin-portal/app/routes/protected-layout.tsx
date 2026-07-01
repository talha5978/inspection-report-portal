import { Outlet } from "react-router";
import { Show, RedirectToSignIn } from "@clerk/react-router";
import { Header } from "~/components/Nav/Header";
import SidebarLayout from "~/components/Nav/sidebar-layout";
import { Toaster } from "~/components/ui/sonner";
import { TopLoadingBar } from "~/components/Loaders/TopLoadingBar";

export default function ProtectedLayout() {
	return (
		<Show when="signed-in" fallback={<RedirectToSignIn redirectUrl="/sign-in" />}>
			<div className="flex h-svh w-screen flex-col overflow-hidden">
				<Header />
				<div className="flex-1 min-h-0">
					<SidebarLayout>
						<Outlet />
					</SidebarLayout>
					<Toaster />
					<TopLoadingBar />
				</div>
			</div>
		</Show>
	);
}
