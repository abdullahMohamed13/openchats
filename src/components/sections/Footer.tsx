import Link from "next/link";
import Image from "next/image";

export default function Footer() {
	return <footer className="bg-[#131114] flex justify-between flex-col md:flex-row section-padding py-6!">
		<Link href="/" className="text-primary font-press-start flex items-center gap-2">
			<Image src="/logo-alt.webp" width={60} height={60} alt="Logo" loading="lazy" />
			openchats
		</Link>
		
		<div className="mt-4 text-xs flex flex-col md:flex-row items-center md:items-start gap-4">
			<p>© 2026 OpenChats All rights reserved</p>
			<div className="flex gap-3">
				<Link href='/terms' className="underline">
					terms
				</Link>
				<Link href='/privacy' className="underline">
					privacy
				</Link>
				<a href='https://github.com/abdullahMohamed13' target="_blank" className="underline">
					contact the website guy
				</a>
			</div>
		</div>
	</footer>
}