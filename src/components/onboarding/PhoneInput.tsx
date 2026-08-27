"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
	AsYouType,
	getCountries,
	getCountryCallingCode,
} from "libphonenumber-js/max";
import type { CountryCode } from "libphonenumber-js/max";
import { cn } from "@/lib/utils";
import { getMaxNationalLength } from "@/lib/phone";

const FLAG_BASE = "https://flagcdn.com/w40/";

type PhoneInputProps = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onChangeCountry: (country: CountryCode) => void;
	country: CountryCode;
	name?: string;
	placeholder?: string;
	autoComplete?: string;
	className?: string;
};

export default function PhoneInput({ id, value, onChange, onChangeCountry, country, name, placeholder, autoComplete,
	className }: PhoneInputProps ) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const displayNames = useMemo(
		() => new Intl.DisplayNames([navigator.language], { type: "region" }),
		[]
	);

	const countries = useMemo<CountryCode[]>(() => getCountries(), []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase().replace(/^\+/, "");
		if (!q) return countries;
		return countries.filter((c) => {
			const name = displayNames.of(c) ?? "";
			const code = getCountryCallingCode(c).toString();
			return (
				name.toLowerCase().includes(q) ||
				c.toLowerCase().includes(q) ||
				code.includes(q) ||
				`+${code}`.includes(`+${q}`)
			);
		});
	}, [countries, query, displayNames]);

	const flagUrl = (c: CountryCode) => {
		const lower = c.replace("-", "").toLowerCase();
		return `${FLAG_BASE}${lower}.png`;
	};

	const formatter = useMemo(() => new AsYouType(country), [country]);
	const maxDigits = useMemo(() => getMaxNationalLength(country), [country]);

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const digits = e.target.value.replace(/\D/g, "");
		if (digits.length > maxDigits) return;
		formatter.reset();
		onChange(formatter.input(e.target.value));
	};

	const selectCountry = (c: CountryCode) => {
		onChangeCountry(c);
		setOpen(false);
		setQuery("");
	};

	return (
		<div className="relative">
			<div
				className={cn(
					"flex h-12 w-full items-stretch overflow-hidden border-2 border-foreground bg-popover",
					className
				)}
			>
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					className="flex shrink-0 items-center gap-2 border-r-2 border-foreground px-3 transition-colors hover:bg-muted"
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-label="Select country"
				>
					<Image
						src={flagUrl(country)}
						alt={displayNames.of(country) ?? country}
						width={20}
						height={14}
						className="h-3.5 w-5 object-cover"
						unoptimized
					/>
					<span className="text-xs font-semibold">
						+{getCountryCallingCode(country)}
					</span>
				</button>
				<input
					id={id}
					name={name}
					type="tel"
					value={value}
					onChange={handleInput}
					placeholder={placeholder}
					autoComplete={autoComplete}
					className="h-full w-full bg-transparent px-3 text-sm font-medium text-foreground outline-none"
				/>
			</div>

			{open && (
				<div
					className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 border-2 border-foreground bg-popover shadow-[3px_3px_0px_var(--border)]"
					role="listbox"
					aria-label="Choose a country"
				>
					<div className="border-b-2 border-foreground p-2">
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search country or dial code (+20)..."
							className="h-9 w-full border-2 border-foreground bg-muted px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
							autoFocus
						/>
					</div>
					<ul className="max-h-56 overflow-y-auto">
						{filtered.map((c) => (
							<li
								key={c}
								role="option"
								aria-selected={c === country}
								onClick={() => selectCountry(c)}
								className={cn(
									"flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-primary",
									c === country && "bg-accent/40"
								)}
							>
								<Image
									src={flagUrl(c)}
									alt="Country Flag"
									width={20}
									height={14}
									className="h-3.5 w-5 object-cover"
									unoptimized
								/>
								<span className="min-w-0 flex-1 truncate">
									{displayNames.of(c) ?? c}
								</span>
								<span className="text-xs text-muted-foreground">
									+{getCountryCallingCode(c)}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{open && (
				<button
					type="button"
					aria-label="Close country selector"
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-20 cursor-default"
				/>
			)}
		</div>
	);
}
