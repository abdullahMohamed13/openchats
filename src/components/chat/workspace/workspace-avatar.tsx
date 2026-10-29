"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function workspaceInitials(name: string): string {
	const [first = "", second = ""] = name.trim().split(/\s+/);
	if (second) return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
	return name.slice(0, 2).toUpperCase();
}

interface WorkspaceAvatarProps {
	name: string;
	imageUrl?: string | null;
	className?: string;
	imageClassName?: string;
	initialsClassName?: string;
}

export function WorkspaceAvatar({
	name,
	imageUrl,
	className,
	imageClassName,
	initialsClassName,
}: WorkspaceAvatarProps) {
	const [failedUrl, setFailedUrl] = useState<string | null>(null);

	return (
		<span
			className={cn(
				"flex shrink-0 items-center justify-center overflow-hidden",
				className,
			)}
		>
			{imageUrl && imageUrl !== failedUrl ? (
				<Image
					src={imageUrl}
					alt=""
					width={96}
					height={96}
					unoptimized
					onError={() => setFailedUrl(imageUrl)}
					className={cn("size-full object-cover", imageClassName)}
				/>
			) : (
				<span
					className={cn(
						"font-press-start text-[10px] uppercase leading-none",
						initialsClassName,
					)}
				>
					{workspaceInitials(name)}
				</span>
			)}
		</span>
	);
}
