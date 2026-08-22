"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/sections/Footer";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAuthPage = pathname.includes("/login") || pathname.includes("/signup");

	return (
		<>
			<div>{children}</div>
			{!isAuthPage && <Footer />}
		</>
	);
}
