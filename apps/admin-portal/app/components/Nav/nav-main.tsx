import { memo } from "react";
import { NavLink, useLocation, useResolvedPath } from "react-router";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { NavItem } from "~/types/nav";
import { navItems } from "~/constants/nav";

const SubItem = memo(({ url, icon, title }: NavItem) => {
	const location = useLocation();
	const resolved = useResolvedPath(url);

	const isActive = location.pathname === resolved.pathname;

	return (
		<SidebarMenuButton className={isActive ? "pointer-events-none" : ""} key={title} asChild>
			<NavLink
				to={url}
				className={isActive ? "bg-sidebar-accent" : ""}
				prefetch="viewport"
				viewTransition
			>
				{icon && <>{icon}</>}
				<span className="my-auto">{title}</span>
			</NavLink>
		</SidebarMenuButton>
	);
});

export function NavMain() {
	return (
		<SidebarGroup className="not-first:border-t-2">
			<SidebarGroupContent className="">
				<SidebarMenu>
					{navItems.map((u, index) => (
						<SidebarMenuItem key={index * 2}>
							<SubItem
								key={(u.title + index).toString()}
								url={u.url}
								icon={u.icon}
								title={u.title}
							/>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
