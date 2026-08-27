import SectionHeader from "../shared/SectionHeader";
import InfoCard from "../shared/InfoCard";
import { USE_CASES } from "@/data/use-cases";

export default function UseCases() {
	return (
		<section className="section-padding">
			<SectionHeader label="Use Cases" title="Built for how you work" lineWidth={129} lineClassName="-mt-5 md:-translate-x-2.5" />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
			{USE_CASES.map((useCase) => (
				<InfoCard key={useCase.title} title={useCase.title} description={useCase.description} />
			))}
			</div>
		</section>
	);
}
