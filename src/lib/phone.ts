import metadata from "libphonenumber-js/metadata.max.json";
import type { CountryCode } from "libphonenumber-js/max";

const DEFAULT_MAX = 15;

const maxCache = new Map<CountryCode, number>();

export function getMaxNationalLength(country: CountryCode): number {
	const cached = maxCache.get(country);
	if (cached !== undefined) return cached;

	const entry = (metadata as { countries?: Record<string, unknown> }).countries?.[
		country
	];
	let max = 0;
	if (entry) {
		const scan = (value: unknown) => {
			if (Array.isArray(value)) {
				value.forEach((item) => {
					if (typeof item === "number" && item > max) max = item;
					else if (Array.isArray(item)) scan(item);
				});
			}
		};
		scan(entry);
	}
	if (max === 0) max = DEFAULT_MAX;
	maxCache.set(country, max);
	return max;
}
