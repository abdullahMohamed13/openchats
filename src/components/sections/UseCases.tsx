import SectionHeader from "../shared/SectionHeader";
import InfoCard from "../shared/InfoCard";

const useCases = [
	{
		title: "Teams",
		description:
			"Keep your team aligned with organized channels for projects, departments, and daily standups. Share files, send quick updates, and keep work conversations searchable and out of email.",
	},
	{
		title: "Clubs & Societies",
		description:
			"Run your student club or society from one place. Coordinate events, share announcements, manage sign-ups, and keep conversations going between meetings.",
	},
	{
		title: "Communities",
		description:
			"Bring your community together with topic-based channels, direct messages, and shared spaces. Whether it's a hobby group, open-source project, or local organization, everyone stays in the loop.",
	},
];

export default function UseCases() {
	return (
		<section className="section-padding">
			<SectionHeader label="Use Cases" title="Built for how you work" lineWidth={129} lineClassName="-mt-5 md:-translate-x-2.5" />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
			{useCases.map((useCase) => (
				<InfoCard key={useCase.title} title={useCase.title} description={useCase.description} />
			))}
			</div>
		</section>
	);
}
