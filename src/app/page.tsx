import Preloader from "@/components/Preloader";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <Hero />
      </main>
    </>
  );
}
