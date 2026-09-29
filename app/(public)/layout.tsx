import Footer from "@/components/sections/Footer";
import SmoothScrollProvider from "@/providers/SmoothScrollProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<SmoothScrollProvider>
			{children}
			<Footer />
		</SmoothScrollProvider>
	);
}
