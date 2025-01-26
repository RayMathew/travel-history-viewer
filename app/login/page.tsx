'use client'

import LoginForm from '../components/LoginForm/loginform';
import { useState } from 'react';

export default function LoginPage() {
    const [panelVisible, setPanelVisible] = useState(false);

    function toggleMotivation() {
        const motivationPanel = document.getElementById("motivationpanel");
        const mainPanel = document.getElementById("mainpanel");
        const content = motivationPanel?.querySelector("div");
        if (!panelVisible) {
            motivationPanel?.classList.add("md:h-72");
            motivationPanel?.classList.add("h-80");
            motivationPanel?.classList.remove("h-0");
            setTimeout(() => {
                content?.classList.remove("opacity-0");
                content?.classList.add("opacity-100");
                mainPanel?.scrollTo({
                    top: mainPanel?.scrollHeight,
                    behavior: "smooth",
                });
            }, 450);
            setPanelVisible(true);
        }
        else {
            motivationPanel?.classList.remove("md:h-72");
            motivationPanel?.classList.remove("h-80");
            motivationPanel?.classList.add("h-0");
            content?.classList.add("opacity-0");
            content?.classList.remove("opacity-100");
            setPanelVisible(false);

        }

    }
    return (
        <main id="mainpanel" className="flex overflow-scroll items-center justify-center h-screen dark:bg-zinc-950 relative">
            <div className="w-full max-w-md space-y-2.5 mt-11 p-4 transition-all duration-500 absolute top-0">
                <div>
                    <LoginForm onClick={toggleMotivation} />
                </div>
                <div id="motivationpanel" className='w-full h-0 transition-all duration-500 dark:bg-zinc-900 rounded-2xl overflow-hidden dark:border-neutral-800'>
                    <div className='opacity-0 p-8 dark:text-zinc-400'>
                        <p>I built this website as a way for my wife and me to revisit our adventures together. Given that we hike, bike and travel regularly, while recording our experiences with photos, journal entries, and AllTrails, there&apos;s a lot to keep track of!</p>
                        <p>Along the way I learnt a ton about NextJS, TailwindCSS and Google Maps API. Check out the GitHub and Medium links to know more.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}