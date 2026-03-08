import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import BehindSystems from "../sections/BehindSystems";
import GitHubActivity from "../sections/GitHubActivity";
import Projects from "../sections/Projects";

export default function Work() {
    return (
        <main style={{ background: '#000', minHeight: '100vh' }}>
            <Navbar />
            <PageHero
                title="MY WORK"
                subtitle="Crafting digital experiences"
                highlight="with passion & code."
            />
            <Projects />
            <GitHubActivity />
            <BehindSystems />
            <Footer/>


        </main>
    );
}