import { useState, useEffect } from 'react';

export default function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
}