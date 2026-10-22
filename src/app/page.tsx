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
import Contact from "@/components/Contact";
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
        <Contact />
      </main>
      <BackToTop />
      <ResumeCorner />
    </>
  );
}
