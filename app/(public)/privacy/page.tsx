import type { Metadata } from "next";
import Link from "next/link";
import {
	LegalList,
	LegalPage,
	LegalSection,
	LegalSubTitle,
	LegalText,
	type TocItem,
} from "@/components/sections/Legal";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "How OpenChats collects, uses, and protects your data.",
};

const toc: TocItem[] = [
	{ id: "introduction", label: "1. Introduction" },
	{ id: "information-we-collect", label: "2. Information We Collect" },
	{ id: "how-we-collect", label: "3. How We Collect Information" },
	{ id: "how-we-use", label: "4. How We Use Your Information" },
	{ id: "cookies", label: "5. Cookies" },
	{ id: "how-we-share", label: "6. How We Share Your Information" },
	{ id: "data-security", label: "7. Data Security" },
	{ id: "data-retention", label: "8. Data Retention" },
	{ id: "your-rights", label: "9. Your Rights and Choices" },
	{ id: "changes", label: "10. Changes to This Policy" },
	{ id: "contact-us", label: "11. Contact Us" },
];

export default function PrivacyPage() {
	return (
		<LegalPage title="Privacy Policy" lastUpdated="24 August 2026" toc={toc}>
			<LegalSection id="introduction" title="1. Introduction">
				<LegalText>
					This Privacy Policy explains how OpenChats (&quot;OpenChats&quot;, &quot;we&quot;, &quot;us&quot;, or
					&quot;our&quot;) collects, uses, shares, and protects your information when you visit openchats.qzz.io or use
					our platform, including workspaces, channels, direct messages, and all related features (together, the
					&quot;Service&quot;).
				</LegalText>
				<LegalText>
					By creating an account or using the Service, you agree to the practices described in this policy. If you do
					not agree with it, please do not use the Service.
				</LegalText>
				<LegalText>
					This policy does not apply to third-party services you may connect to or interact with through the Service.
					Those services are governed by their own privacy policies.
				</LegalText>
			</LegalSection>

			<LegalSection id="information-we-collect" title="2. Information We Collect">
				<LegalText>Depending on how you use the Service, we collect the following categories of information:</LegalText>
				<div className="space-y-3">
					<div className="space-y-1">
						<LegalSubTitle>Account information</LegalSubTitle>
						<LegalText>
							When you register, we collect your name (or nickname) and email address, along with a password used to
							secure your account.
						</LegalText>
					</div>
					<div className="space-y-1">
						<LegalSubTitle>Content you share</LegalSubTitle>
						<LegalText>
							Messages, images, files, and voice messages that you send in workspaces, channels, and direct messages.
							This also includes workspace and channel names, descriptions, and membership details.
						</LegalText>
					</div>
					<div className="space-y-1">
						<LegalSubTitle>Usage and device information</LegalSubTitle>
						<LegalText>
							Technical data collected as you interact with the Service, such as your IP address, browser type,
							device characteristics, pages you view, actions you take, and related log data.
						</LegalText>
					</div>
					<div className="space-y-1">
						<LegalSubTitle>Cookies and similar technologies</LegalSubTitle>
						<LegalText>
							Small files stored on your device that help the Service function and help us understand how it is
							used. See our{" "}
							<Link href="/cookie-policy" className="text-primary underline underline-offset-4">
								Cookie Policy
							</Link>{" "}
							for details.
						</LegalText>
					</div>
				</div>
			</LegalSection>

			<LegalSection id="how-we-collect" title="3. How We Collect Information">
				<LegalText>We collect information in three main ways:</LegalText>
				<LegalList>
					<li>
						<strong className="text-foreground">Directly from you:</strong> when you create an account, join or set up
						workspaces and channels, share content, or contact us for support.
					</li>
					<li>
						<strong className="text-foreground">Automatically:</strong> as you navigate and use the Service, through
						cookies, server logs, and similar technologies.
					</li>
					<li>
						<strong className="text-foreground">From service providers:</strong> trusted partners that operate parts
						of our infrastructure may process technical data on our behalf when delivering the Service to you.
					</li>
				</LegalList>
			</LegalSection>

			<LegalSection id="how-we-use" title="4. How We Use Your Information">
				<LegalText>We use the information we collect to:</LegalText>
				<LegalList>
					<li>Provide, operate, and maintain the Service, including delivering messages in real time.</li>
					<li>Create and manage your account, workspaces, channels, and memberships.</li>
					<li>Detect, investigate, and prevent spam, abuse, fraud, and unauthorized access.</li>
					<li>Respond to your questions, feedback, and support requests.</li>
					<li>Understand how the Service is used so we can fix issues and improve features.</li>
					<li>Send administrative and service-related updates, such as changes to the Service or this policy.</li>
					<li>Comply with applicable legal obligations.</li>
				</LegalList>
				<LegalText>
					We do not sell your personal information, and we do not use it to serve third-party advertising.
				</LegalText>
			</LegalSection>

			<LegalSection id="cookies" title="5. Cookies">
				<LegalText>
					Cookies are small data files stored on your device when you browse the internet. On OpenChats, essential
					cookies keep core features working, such as keeping you signed in and securing your session, while other
					technologies help us understand how the Service is used so we can improve it.
				</LegalText>
				<LegalText>
					You can control or delete cookies through your browser settings at any time. To learn more about how we use
					them, read our{" "}
					<Link href="/cookie-policy" className="text-primary underline underline-offset-4">
						Cookie Policy
					</Link>
					.
				</LegalText>
			</LegalSection>

			<LegalSection id="how-we-share" title="6. How We Share Your Information">
				<LegalText>
					We do not sell your personal information. We only share it when necessary to run the Service, with:
				</LegalText>
				<LegalList>
					<li>
						<strong className="text-foreground">Convex</strong>, the backend platform we use to store account,
						workspace, and message data.
					</li>
					<li>
						<strong className="text-foreground">Stream</strong>, the real-time chat infrastructure that powers
						messaging across the Service.
					</li>
					<li>
						<strong className="text-foreground">Cloudflare</strong>, which hosts and delivers the website and
						application.
					</li>
					<li>
						<strong className="text-foreground">Authorities</strong>, where required by law, legal process, or to
						protect the rights, property, or safety of OpenChats, our users, or others.
					</li>
					<li>
						<strong className="text-foreground">A successor entity</strong>, in connection with a merger,
						acquisition, or sale of assets, in which case your information may be transferred as part of that
						transaction.
					</li>
				</LegalList>
				<LegalText>
					These providers process information only on our instructions and are bound by appropriate contractual
					safeguards.
				</LegalText>
			</LegalSection>

			<LegalSection id="data-security" title="7. Data Security">
				<LegalText>
					We take reasonable technical and organizational measures to protect your information, including encryption
					in transit, access controls, and ongoing security reviews of our systems.
				</LegalText>
				<LegalText>
					However, no method of transmission over the internet or electronic storage is completely secure, and we
					cannot guarantee absolute security. Please also do your part by keeping your password confidential and not
					sharing it with anyone.
				</LegalText>
			</LegalSection>

			<LegalSection id="data-retention" title="8. Data Retention">
				<LegalText>
					We keep your personal information for as long as your account is active or as needed to provide the
					Service. When information is no longer needed, we delete or anonymize it, unless we are required to retain
					it by law or legitimate business purposes.
				</LegalText>
				<LegalText>
					If you delete content or request deletion of your account, residual copies may persist in backups for a
					limited period before being permanently removed.
				</LegalText>
			</LegalSection>

			<LegalSection id="your-rights" title="9. Your Rights and Choices">
				<LegalText>You have choices and rights regarding your personal information, including the right to:</LegalText>
				<LegalList>
					<li>Access the personal information we hold about you.</li>
					<li>Request correction of inaccurate information, which you can often do directly from your profile.</li>
					<li>Request deletion of your account and associated personal information.</li>
					<li>Object to or ask us to restrict certain processing of your information.</li>
				</LegalList>
				<LegalText>
					To exercise any of these rights, contact us using the details in the section below. We may need to verify
					your identity before fulfilling certain requests.
				</LegalText>
			</LegalSection>

			<LegalSection id="changes" title="10. Changes to This Policy">
				<LegalText>
					We may update this Privacy Policy from time to time. Whenever we make changes, we will post the updated
					policy on this page and revise the &quot;Last updated&quot; date at the top.
				</LegalText>
				<LegalText>
					If we make material changes to how we handle your personal information, we will notify you through the
					Service or by email before the changes take effect. It is your responsibility to review this policy
					periodically for updates.
				</LegalText>
			</LegalSection>

			<LegalSection id="contact-us" title="11. Contact Us">
				<LegalText>If you have questions about this policy or how we handle your data, reach out to us:</LegalText>
				<LegalList>
					<li>
						Email:{" "}
						<a href="mailto:openchats.team@gmail.com" className="text-primary underline underline-offset-4">
							openchats.team@gmail.com
						</a>
					</li>
					<li>
						Phone:{" "}
						<a href="tel:+201010434465" className="text-primary underline underline-offset-4">
							+20 101 043 4465
						</a>
					</li>
				</LegalList>
			</LegalSection>
		</LegalPage>
	);
}
