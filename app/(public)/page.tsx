import HeroSection from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/CoreFeatures";
import UseCases from "@/components/sections/UseCases";
import FAQSection from "@/components/sections/FAQ";
import CTABannerSection from "@/components/sections/CTABanner";

export default function Home() {
	return <div className="h-full">
		<HeroSection />
		<HowItWorks />
		<Features />
		<UseCases />
		<FAQSection />
		<CTABannerSection />
	</div>
}
