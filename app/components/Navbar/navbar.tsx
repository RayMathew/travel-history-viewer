import Image from "next/image";
import NavbarAvatar from "./navbaravatar";

export default function Navbar() {

    return (
        <>
            <div className="flex-1 flex">
                <Image
                    className="mx-4 self-center object-cover object-center rounded-lg"
                    src="/favicon.ico"
                    width={40}
                    height={40}
                    alt="Logo"
                    priority={false}
                />
                <div className="font-semibold self-center">Memoir Map</div>
            </div>
            <div className="p-4">
                <NavbarAvatar />
            </div>
        </>
    )

}