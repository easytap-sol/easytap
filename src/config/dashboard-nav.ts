import {
  LayoutDashboard,
  Wallet,
  Users,
  FileText,
  Settings,
  PieChart,
  PlusCircle,
  History,
  CreditCard
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
};

// 1. Links for Customers (Borrowers)
export const customerNav: NavItem[] = [
  {
    title: "Overview",
    href: "/customer/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Apply for Loan",
    href: "/customer/apply",
    icon: PlusCircle,
  },
  {
    title: "My Loans",
    href: "/customer/loans",
    icon: History,
  },
  {
    title: "Profile",
    href: "/customer/profile",
    icon: Settings,
  },
];

// 2. Links for Admins/Staff
export const adminNav: NavItem[] = [
  {
    title: "Overview",
    href: "/admin/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Loan Products",
    href: "/admin/products",
    icon: Wallet,
  },
  {
    title: "Loan Applications",
    href: "/admin/loans",
    icon: FileText,
  },
  {
    title: "Create Loan",
    href: "/admin/loans/create",
    icon: PlusCircle,
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: Settings,
  },
];