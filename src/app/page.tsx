import Preloader from "@/components/Preloader";
import ScrollProgress from "@/components/ScrollProgress";
import GlowCursor from "@/components/GlowCursor";
import Header from "@/components/Header";
import SocialRail from "@/components/SocialRail";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
import About from "@/components/About";
import WhatIDo from "@/components/WhatIDo";
import TechStack from "@/components/TechStack";
import Projects from "@/components/Projects";
import Journey from "@/components/Journey";
import HowIWork from "@/components/HowIWork";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import QuickActions from "@/components/QuickActions";
import BackToTop from "@/components/BackToTop";
import ResumeCorner from "@/components/ResumeCorner";

export default function Home() {
  return (
    <>
      <Preloader />
      <ScrollProgress />
      <GlowCursor />
      <Header />
      <SocialRail />
      <main>
        <Hero />
        <StatsBand />
        <About />
        <WhatIDo />
        <TechStack />
        <Projects />
        <Journey />
        <HowIWork />
        <Contact />
      </main>
      <Footer />
      <QuickActions />
      <BackToTop />
      <ResumeCorner />
    </>
  );
}
