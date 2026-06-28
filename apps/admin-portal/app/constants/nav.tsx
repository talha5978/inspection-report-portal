import { LayoutDashboard, FileText, Users, QrCode, Settings, Upload } from "lucide-react";
import type { NavItem } from "~/types/nav";

export const navItems: NavItem[] = [
	{
		title: "Dashboard",
		url: "/",
		icon: <LayoutDashboard className="w-5 h-5" />,
	},
	{
		title: "Documents",
		url: "/documents",
		icon: <FileText className="w-5 h-5" />,
	},
	{
		title: "Upload Document",
		url: "/documents/new",
		icon: <Upload className="w-5 h-5" />,
	},
	{
		title: "Clients",
		url: "/clients",
		icon: <Users className="w-5 h-5" />,
	},
	{
		title: "QR Codes",
		url: "/qr-codes",
		icon: <QrCode className="w-5 h-5" />,
	},
	{
		title: "Settings",
		url: "/settings",
		icon: <Settings className="w-5 h-5" />,
	},
];
