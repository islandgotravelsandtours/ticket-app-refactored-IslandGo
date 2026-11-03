import {Briefcase, CircleUser, Globe, Receipt, Ticket} from "lucide-react";
import {accountProfilePath, bookingsPath, homePath, toursPath, transactionsPath} from "@/paths";
import {NavItem} from "./types";

export const navItems: NavItem[] = [
    {
        title: "Explore Tours",
        icon: <Globe/>,
        href: homePath(),
    },
    {
        title: "Manage Tours",
        icon: <Briefcase/>,
        href: toursPath(),
        role: "ADMIN",
    },
    {
        title: "All Bookings",
        icon: <Ticket/>,
        href: bookingsPath(),
        role: "ADMIN",
    },
    {
        title: "My Bookings",
        icon: <Ticket/>,
        href: bookingsPath(),
        role: "CUSTOMER",
    },
    {
        title: "All Transactions",
        icon: <Receipt/>,
        href: transactionsPath(),
        role: "ADMIN",
    },
    {
        title: "Payment History",
        icon: <Receipt/>,
        href: transactionsPath(),
        role: "CUSTOMER",
    },
    {
        separator: true,
        title: "Account",
        icon: <CircleUser/>,
        href: accountProfilePath(),
    },
];

export const closedClassName =
    "text-background opacity-0 transition-all duration-300 group-hover:z-40 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100";