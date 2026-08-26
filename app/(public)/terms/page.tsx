import type { Metadata } from "next";
import {
	LegalList,
	LegalPage,
	LegalSection,
	LegalSubTitle,
	LegalText,
	type TocItem,
} from "@/components/sections/Legal";

export const metadata: Metadata = {
	title: "Terms of Service",
	description: "The rules and guidelines for using OpenChats.",
};

const toc: TocItem[] = [
	{ id: "acceptance", label: "1. Acceptance of Terms" },
	{ id: "eligibility", label: "2. Eligibility" },
	{ id: "accounts", label: "3. Accounts" },
	{ id: "acceptable-use", label: "4. Acceptable Use" },
	{ id: "content", label: "5. Your Content" },
	{ id: "workspace-rules", label: "6. Workspaces & Channels" },
	{ id: "suspension", label: "7. Suspension & Termination" },
	{ id: "disclaimers", label: "8. Disclaimers" },
	{ id: "liability", label: "9. Limitation of Liability" },
	{ id: "indemnification", label: "10. Indemnification" },
	{ id: "modifications", label: "11. Modifications to Terms" },
	{ id: "governing-law", label: "12. Governing Law" },
	{ id: "contact", label: "13. Contact Us" },
];

export default function TermsPage() {
	return (
		<LegalPage title="Terms of Service" lastUpdated="24 August 2026" toc={toc}>
			<LegalSection id="acceptance" title="1. Acceptance of Terms">
				<LegalText>
					These Terms of Service (&quot;Terms&quot;) govern your access to and use of the OpenChats platform,
					including the website at openchats.qzz.io, all related features, workspaces, channels, direct
					messages, and any associated services (together, the &quot;Service&quot;).
				</LegalText>
				<LegalText>
					By creating an account or using the Service, you agree to be bound by these Terms. If you do not
					agree, do not use the Service.
				</LegalText>
			</LegalSection>

			<LegalSection id="eligibility" title="2. Eligibility">
				<LegalText>
					You must be at least 13 years old to use the Service. By using the Service, you represent and
					warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
				</LegalText>
				<LegalText>
					If you are using the Service on behalf of an organization, you represent that you have the
					authority to bind that organization to these Terms.
				</LegalText>
			</LegalSection>

			<LegalSection id="accounts" title="3. Accounts">
				<LegalSubTitle>Account creation</LegalSubTitle>
				<LegalText>
					To use most features you must create an account by providing accurate and complete information.
					You are responsible for maintaining the confidentiality of your credentials.
				</LegalText>

				<LegalSubTitle>Account security</LegalSubTitle>
				<LegalText>
					You are responsible for all activity that occurs under your account. If you suspect unauthorized
					access, notify us immediately at{" "}
					<a href="mailto:openchats.team@gmail.com" className="text-primary underline underline-offset-4">
						openchats.team@gmail.com
					</a>
					.
				</LegalText>

				<LegalSubTitle>One person, one account</LegalSubTitle>
				<LegalText>
					Each individual may maintain one account. Creating multiple accounts to circumvent moderation
					or platform rules is prohibited.
				</LegalText>
			</LegalSection>

			<LegalSection id="acceptable-use" title="4. Acceptable Use">
				<LegalText>You agree not to use the Service to:</LegalText>
				<LegalList>
					<li>
						Send spam, chain letters, pyramid schemes, or other unsolicited bulk messages.
					</li>
					<li>
						Upload or distribute malware, viruses, or any code designed to disrupt, damage, or gain
						unauthorized access to the Service or other systems.
					</li>
					<li>
						Harass, threaten, defame, or otherwise violate the rights of others.
					</li>
					<li>
						Post content that is illegal, obscene, hateful, or that promotes violence or illegal
						activity.
					</li>
					<li>
						Impersonate another person or entity, or misrepresent your affiliation with any person
						or entity.
					</li>
					<li>
						Attempt to gain unauthorized access to other accounts, systems, or networks connected
						to the Service.
					</li>
					<li>
						Scrape, crawl, or use automated tools to extract data from the Service without our
						written permission.
					</li>
					<li>
						Use the Service in any way that violates applicable laws or regulations.
					</li>
				</LegalList>
			</LegalSection>

			<LegalSection id="content" title="5. Your Content">
				<LegalSubTitle>Ownership</LegalSubTitle>
				<LegalText>
					You retain full ownership of all messages, images, files, voice notes, and other content you
					post or share through the Service (&quot;Your Content&quot;). These Terms do not grant us any
					ownership rights over Your Content.
				</LegalText>

				<LegalSubTitle>License to us</LegalSubTitle>
				<LegalText>
					By posting or sharing content through the Service, you grant OpenChats a limited, worldwide,
					non-exclusive, royalty-free license to host, store, transmit, and display Your Content solely
					for the purpose of operating and providing the Service to you and other workspace members.
				</LegalText>

				<LegalSubTitle>Removal</LegalSubTitle>
				<LegalText>
					You may delete Your Content at any time. Upon deletion, we will remove it from our active
					systems, though residual copies may persist in backups for a limited period before being
					permanently removed.
				</LegalText>
			</LegalSection>

			<LegalSection id="workspace-rules" title="6. Workspaces &amp; Channels">
				<LegalSubTitle>Workspace owners</LegalSubTitle>
				<LegalText>
					The person who creates a workspace is its owner and is responsible for its settings,
					membership, and channel organization. Workspace owners can manage members, including
					removing them.
				</LegalText>

				<LegalSubTitle>Channel moderation</LegalSubTitle>
				<LegalText>
					Workspace owners and designated moderators may set rules for individual channels, pin
					messages, and manage membership within their workspace.
				</LegalText>

				<LegalSubTitle>Your responsibility</LegalSubTitle>
				<LegalText>
					You are responsible for the content you share within any workspace or channel you belong to.
					Moderation decisions made by workspace owners are their responsibility.
				</LegalText>
			</LegalSection>

			<LegalSection id="suspension" title="7. Suspension &amp; Termination">
				<LegalText>
					We reserve the right to suspend or terminate your account at our discretion if you violate
					these Terms, engage in prohibited conduct, or create risk for the Service or other users.
				</LegalText>
				<LegalText>
					We will make reasonable efforts to notify you before or after taking such action, except
					where immediate action is necessary to prevent harm.
				</LegalText>
				<LegalText>
					Upon termination, your right to use the Service ceases immediately. We will retain your
					data for a limited period in accordance with our Privacy Policy before deleting it.
				</LegalText>
			</LegalSection>

			<LegalSection id="disclaimers" title="8. Disclaimers">
				<LegalText>
					The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties
					of any kind, whether express or implied, including but not limited to warranties of
					merchantability, fitness for a particular purpose, or non-infringement.
				</LegalText>
				<LegalText>
					We do not warrant that the Service will be uninterrupted, error-free, secure, or free
					of viruses or other harmful components. We do not guarantee the accuracy, completeness,
					or reliability of any content shared through the Service.
				</LegalText>
			</LegalSection>

			<LegalSection id="liability" title="9. Limitation of Liability">
				<LegalText>
					To the maximum extent permitted by applicable law, OpenChats, its officers, directors,
					employees, and agents shall not be liable for any indirect, incidental, special,
					consequential, or punitive damages, including but not limited to loss of profits, data,
					business opportunities, or goodwill, arising out of or in connection with your use of
					the Service, regardless of the theory of liability.
				</LegalText>
				<LegalText>
					Our total aggregate liability for any claims arising out of these Terms or your use of
					the Service shall not exceed the amount you have paid to us in the twelve (12) months
					preceding the claim, or one hundred US dollars (USD $100), whichever is greater.
				</LegalText>
			</LegalSection>

			<LegalSection id="indemnification" title="10. Indemnification">
				<LegalText>
					You agree to indemnify, defend, and hold harmless OpenChats and its officers, directors,
					employees, and agents from and against any claims, liabilities, damages, losses, and
					expenses (including reasonable attorneys&apos; fees) arising out of or in connection with:
				</LegalText>
				<LegalList>
					<li>Your use of the Service.</li>
					<li>Your violation of these Terms.</li>
					<li>Your violation of any rights of a third party.</li>
					<li>Any content you post or share through the Service.</li>
				</LegalList>
			</LegalSection>

			<LegalSection id="modifications" title="11. Modifications to Terms">
				<LegalText>
					We may revise these Terms from time to time. When we make material changes, we will post
					the updated Terms on this page and update the &quot;Last updated&quot; date. For significant changes,
					we will notify you through the Service or by email before they take effect.
				</LegalText>
				<LegalText>
					Your continued use of the Service after the updated Terms take effect constitutes your
					acceptance of the revised Terms. If you do not agree, stop using the Service and contact
					us to close your account.
				</LegalText>
			</LegalSection>

			<LegalSection id="governing-law" title="12. Governing Law">
				<LegalText>
					These Terms are governed by and construed in accordance with the laws of the Arab Republic
					of Egypt, without regard to its conflict-of-law provisions. Any disputes arising under
					these Terms shall be subject to the exclusive jurisdiction of the courts in Cairo, Egypt.
				</LegalText>
			</LegalSection>

			<LegalSection id="contact" title="13. Contact Us">
				<LegalText>
					If you have questions about these Terms or need to report a violation, reach out to us:
				</LegalText>
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
