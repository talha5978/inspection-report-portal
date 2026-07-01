import { Outlet } from "react-router";
import { Show, RedirectToSignIn } from "@clerk/react-router";

export default function ProtectedLayout() {
	return (
		<Show when="signed-in" fallback={<RedirectToSignIn redirectUrl="/sign-in" />}>
			<div className="flex h-svh flex-col overflow-hidden">
				<div className="flex-1 min-h-0 p-6 overflow-y-auto">
					<Outlet />
				</div>
			</div>
		</Show>
	);
}
