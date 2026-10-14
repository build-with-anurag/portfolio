import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import SocialRail from './components/SocialRail'
import Hero from './components/Hero'
import Work from './components/Work'
import Skills from './components/Skills'
import Journey from './components/Journey'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <SocialRail />
      <main className="page-main" id="top">
        <Hero />
        <Work />
        <Skills />
        <Journey />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
