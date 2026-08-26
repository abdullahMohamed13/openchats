import Link from "next/link";
import Image from "next/image";
import arrowIcon from "@/assets/icons/arrow.webp";

type BackLinkProps = {
	href: string;
	text: string;
};

export default function BackLink({ href, text }: BackLinkProps) {
	return (
		<Link href={href} className="group underline font-press-start inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
			<Image src={arrowIcon} alt="Arrow Icon" width={32} height={32} className="group-hover:scale-110 rotate-180 size-8" />
			<p className="mt-1">{text}</p>
		</Link>
	);
}
