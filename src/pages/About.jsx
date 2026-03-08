import { useEffect } from "react";
import PageHero from '../components/PageHero';
import Glace from '../sections/Glace';
import GitHubActivity from '../sections/GitHubActivity';
import BehindSystems from '../sections/BehindSystems';
import Footer from '../components/Footer';

export default function About() {
    useEffect(() => {
        document.title = "About | Moin Sheikh";
    }, []);
    return (
        <main style={{ background: '#000', minHeight: '100vh' }}>
            <PageHero
                title="ABOUT ME"
                subtitle="Get to know more about"
                highlight="who i am."
            />
            <Glace
                label="A LITTLE ABOUT ME"
                headline="Nice to meet you. I'm"
                highlight="Moin"
                description={
                    <>
                        <p>
                            I transform ambitious ideas into intelligent, scalable digital products. As an AI developer and full-stack engineer, I focus on building systems that combine thoughtful architecture, smooth user experiences, and real-world practicality.
                        </p>
                        <p>
                            My work sits at the intersection of artificial intelligence and modern web development. From platforms like MadeIt that turn learning progress into proof-of-work portfolios, to Nexora Learn AI that generates personalized study plans, I design products that solve meaningful problems using technology.
                        </p>
                        <p>
                            Beyond writing code, I think deeply about how products are built, shipped, and scaled. I enjoy turning complex ideas into simple, usable tools — whether it's an AI system, a developer platform, or a productivity application.
                        </p>
                    </>
                }
                final="My philosophy is simple: build systems that think, scale, and create impact."
            />

            <GitHubActivity />

            <BehindSystems />

            <Footer />

            {/* Rest of About page content goes below */}
        </main>
    );
}
