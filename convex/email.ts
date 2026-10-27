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

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

type WorkspaceInviteEmailParams = {
	to: string;
	workspaceName: string;
	inviterName: string;
	url: string;
};

export async function sendWorkspaceInviteEmail({
	to,
	workspaceName,
	inviterName,
	url,
}: WorkspaceInviteEmailParams): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.RESEND_FROM_EMAIL;

	if (!apiKey || !from) {
		throw new Error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
	}

	const safeWorkspace = escapeHtml(workspaceName);
	const safeInviter = escapeHtml(inviterName);
	const safeUrl = escapeHtml(url);

	const html = `<!DOCTYPE html>
<html>
	<body style="margin:0;padding:0;background:#f5f3ec;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ec;padding:32px 16px;">
			<tr>
				<td align="center">
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#ffffff;border:2px solid #1b1b1b;">
						<tr>
							<td style="padding:32px;">
								<p style="margin:0 0 16px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6b6b6b;">OpenChats</p>
								<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#1b1b1b;">Join ${safeWorkspace}</h1>
								<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3d3d3d;">
									${safeInviter} invited you to chat in the <strong>${safeWorkspace}</strong> workspace.
								</p>
								<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
									<tr>
										<td style="background:#1b1b1b;">
											<a href="${safeUrl}" style="display:inline-block;padding:14px 24px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">Accept invite</a>
										</td>
									</tr>
								</table>
								<p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#6b6b6b;">Or paste this link into your browser:</p>
								<p style="margin:0;font-size:12px;line-height:1.5;color:#1b1b1b;word-break:break-all;">${safeUrl}</p>
								<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#8a8a8a;">This invite expires in 7 days. If you weren't expecting it, you can ignore this email.</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`;

	const text = `${inviterName} invited you to join the ${workspaceName} workspace on OpenChats.\n\nAccept the invite: ${url}\n\nThis invite expires in 7 days.`;

	const response = await fetch(RESEND_ENDPOINT, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from,
			to: [to],
			subject: `Join ${workspaceName} on OpenChats`,
			html,
			text,
		}),
	});

	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new Error(`Resend failed (${response.status}): ${detail.slice(0, 300)}`);
	}
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
