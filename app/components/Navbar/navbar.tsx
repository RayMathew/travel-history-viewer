import Image from "next/image";
import NavbarAvatar from "./navbaravatar";
import { Button } from 'primereact/button';

export default function Navbar() {

    return (
        <>
            <div className="flex w-1/2 justify-between md:justify-start">
                <Button
                    className="md:hidden"
                    icon="pi pi-bars"
                    rounded
                    text
                    raised
                />
                <Image
                    className="md:mx-4 self-center translate-x-1/2 md:translate-x-0 object-cover object-center rounded-lg"
                    src="/favicon.ico"
                    width={40}
                    height={40}
                    alt="Logo"
                    priority={false}
                />
                <div className="font-semibold self-center hidden md:block md:translate-x-0">Memoir Map</div>
            </div>
            <div className="p-4 flex w-1/2 justify-end">
                <NavbarAvatar />
            </div>
        </>
    )

}