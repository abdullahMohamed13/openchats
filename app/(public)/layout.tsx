import Footer from "@/components/sections/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<Footer />
		</>
	);
}
