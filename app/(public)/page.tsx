import CTABannerSection from "@/components/sections/CTABanner";
import FAQSection from "@/components/sections/FAQ";
import HeroSection from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import ProblemSection from "@/components/sections/Problem";

export default function Home() {
	return <div className="h-full">
		<HeroSection />
		<HowItWorks />
		<ProblemSection />
		<FAQSection />
		<CTABannerSection />
	</div>
}
