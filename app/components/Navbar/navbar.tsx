import Image from "next/image";
import NavbarAvatar from "./navbaravatar";
import { Button } from 'primereact/button';

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {

    return (
        <>
            <div className="flex w-1/2 justify-between md:justify-start">
                <Button
                    className="md:hidden sidebar-button"
                    icon="pi pi-bars"
                    rounded
                    text
                    raised
                    onClick={onMenuClick}
                    aria-label="Open sidebar"
                />
                <Image
                    className="md:mx-4 self-center translate-x-1/2 md:translate-x-0 object-cover object-center rounded-lg"
                    src="/favicon.ico"
                    width={40}
                    height={40}
                    alt="Memoir Map Logo"
                    priority={false}
                />
                <div className="font-semibold text-lg self-center hidden md:block md:translate-x-0">Memoir Map</div>
            </div>
            <div className="p-4 flex w-1/2 justify-end">
                <NavbarAvatar />
            </div>
        </>
    )

}