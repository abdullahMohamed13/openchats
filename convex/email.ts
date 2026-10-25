const RESEND_ENDPOINT = "https://api.resend.com/emails";

type ResetEmailParams = {
	to: string;
	name?: string | null;
	url: string;
};

export async function sendPasswordResetEmail({ to, name, url }: ResetEmailParams): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.RESEND_FROM_EMAIL;

	if (!apiKey || !from) {
		throw new Error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
	}

	const response = await fetch(RESEND_ENDPOINT, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from,
			to: [to],
			template: {
				id: "f4d3ded5-4e60-4933-a7c7-3e4e7f9e6abb",
				variables: {
					USER_NAME: name || "OpenChats User",
					RESET_PASSWORD_URL: url,
				}
			}
		}),
	});

	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new Error(`Resend failed (${response.status}): ${detail.slice(0, 300)}`);
	}
}

// function escapeHtml(value: string): string {
// 	return value
// 		.replace(/&/g, "&amp;")
// 		.replace(/</g, "&lt;")
// 		.replace(/>/g, "&gt;")
// 		.replace(/"/g, "&quot;")
// 		.replace(/'/g, "&#39;");
// }


export function toSiteUrl(url: string): string {
	const siteUrl = process.env.SITE_URL;
	if (!siteUrl) return url;

	try {
		const parsed = new URL(url);
		const site = new URL(siteUrl);
		return new URL(parsed.pathname + parsed.search, site.origin).toString();
	} catch {
		return url;
	}
}
