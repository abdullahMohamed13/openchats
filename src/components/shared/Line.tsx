import Image from "next/image";
import LineImage from '@/assets/icons/line.png'

export function Line({ className, width = 128, height = 39 }: { className?: string, width?: number, height?: number }) {
	return <Image
		src={LineImage}
		width={width} height={height}
		className={className}
		loading="lazy" alt="Line"
	/>
}