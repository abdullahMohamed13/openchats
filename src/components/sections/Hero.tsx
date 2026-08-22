import Link from "next/link";
import BrutalButton from "../ui/brutal-button";
import Image from "next/image";

export default function HeroSection() {
	return <section className="min-h-screen flex-col-center"
		style={{
			background: "linear-gradient(rgba(18, 98, 58, 0.85), rgba(18, 98, 58, 0.90)), url('/hero-background.webp')",
			backgroundSize: "cover",
			backgroundPosition: "center",
		}}>
		
		<Image src="/logo-hero.png" width={150} height={150} alt="Logo" loading="eager" />
		<div className="font-brogetta flex-col-center mb-4">
			<h1 className=" font-bold text-6xl! md:text-7xl lg:text-8xl!">OpenChats</h1>
	
			<h2 className="italic capitalize">Your team | Your conversations | One place.</h2>
		</div>
		<p>Bring your teams, workspaces, channels, and direct conversations together in one place.</p>

		<Link href='/signup'>
			<BrutalButton className="mt-5">
				Get Started
			</BrutalButton>
		</Link>

	</section>
}
