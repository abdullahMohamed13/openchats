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
			subject: "Reset your OpenChats password",
			text: [
				`Hi${name ? ` ${name}` : ""},`,
				"",
				"We received a request to reset your OpenChats password.",
				"",
				`Reset your password: ${url}`,
				"",
				"This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
			].join("\n"),
			html: `
				<div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.5;">
					<p>Hi${name ? ` ${escapeHtml(name)}` : ""},</p>
					<p>We received a request to reset your OpenChats password.</p>
					<p><a href="${url}">Reset your password</a></p>
					<p style="color:#666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
				</div>`.trim(),
		}),
	});

	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new Error(`Resend failed (${response.status}): ${detail.slice(0, 300)}`);
	}
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}


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
