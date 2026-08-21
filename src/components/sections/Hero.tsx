import Link from "next/link";
import BrutalButton from "../ui/brutal-button";
import Image from "next/image";

export default function HeroSection() {
	return <section className="min-h-screen bg-primary flex-col-center">
		<Image src="/logo-hero.png" width={150} height={150} alt="Logo" />
		<div className="font-brogetta flex-col-center mb-4">
			<h1 className=" font-bold text-6xl! md:text-7xl lg:text-8xl!">OpenChats</h1>
	
			<h2 className="italic capitalize">Your team | Your conversations | One place.</h2>
		</div>
		<p>Bring your teams, workspaces, channels, and direct conversations together in one place.</p>

		<Link href='/login'>
			<BrutalButton className="mt-5">
				Get Started
			</BrutalButton>
		</Link>

	</section>
}
