import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

type TestimonialCardProps = {
	speaker: string;
	role?: string;
	quote: string;
	img: StaticImageData;
	href?: string;
};

export default function TestimonialCard({ speaker, role, quote, img, href }: TestimonialCardProps) {
	return (
		<div className="h-full rounded-base border-2 border-foreground/10 shadow-shadow bg-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
			<Image
				src={img}
				alt={speaker}
				width={120}
				height={120}
				className="rounded-full object-cover size-[120px]"
			/>
			<div className="flex flex-col gap-3 text-center md:text-left flex-1">
				<p className="text-sm md:text-base text-muted-foreground leading-relaxed italic">
					&quot;{quote}&quot;
				</p>
				<div className="flex items-center gap-2 justify-center md:justify-start">
					<p className="text-sm font-bold text-foreground">
						- {speaker}
					</p>
					{href && (
						<Link href={href} target="_blank" rel="noopener noreferrer" aria-label={`${speaker} on YouTube`}>
							<svg
								viewBox="0 0 24 24"
								fill="currentColor"
								className="size-4 text-muted-foreground hover:text-primary transition-colors"
							>
								<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
							</svg>
						</Link>
					)}
				</div>
				{role && (
					<p className="text-xs text-muted-foreground">{role}</p>
				)}
			</div>
		</div>
	);
}
