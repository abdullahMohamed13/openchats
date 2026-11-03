import Navbar from "@/components/guest/reusable/Navbar";
import HeroSection from "@/components/guest/Hero";
import HowItWorks from "@/components/guest/HowItWorks";
import Features from "@/components/guest/CoreFeatures";
import UseCases from "@/components/guest/UseCases";
import FAQSection from "@/components/guest/FAQ";
import CTABannerSection from "@/components/guest/CTABanner";

export default function Home() {
	return <div className="h-full">
		<Navbar />
		<HeroSection />
		<UseCases />
		<Features />
		<HowItWorks />
		<FAQSection />
		<CTABannerSection />
	</div>
}
