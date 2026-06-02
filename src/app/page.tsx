import Hero from "@/components/marketing/homepage/Hero";
import Features from "@/components/marketing/homepage/Features";
import HowItWorks from "@/components/marketing/homepage/HowItWorks";
import PlannerCategories from "@/components/marketing/homepage/PlannerCategories";
import FeaturedPlanners from "@/components/marketing/homepage/FeaturedPlanners";
import DashboardPreview from "@/components/marketing/homepage/DashboardPreview";
import PricingPreview from "@/components/marketing/homepage/PricingPreview";
import Testimonials from "@/components/marketing/homepage/Testimonials";
import CTASection from "@/components/marketing/homepage/CTASection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <PlannerCategories />
      <FeaturedPlanners />
      <DashboardPreview />
      <PricingPreview />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
