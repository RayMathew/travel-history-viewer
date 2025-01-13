import React, { useMemo, useRef } from "react";
import { Avatar } from 'primereact/avatar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Menu as OverlayRows } from 'primereact/menu';
import { Skeleton } from 'primereact/skeleton';
import { logout } from "@/lib/actions";
import { UserContext } from "@/app/providers/UserProvider/userprovider";
import { useContext } from "react";
import { useRouter } from 'next/navigation';


export default function NavbarAvatar() {
    const userContext = useContext(UserContext);
    const router = useRouter();
    const op = useRef<OverlayPanel>(null);

    const { userName } = userContext;

    const handleSignOut = async () => {
        localStorage.clear();
        await logout();

        router.push('/login');
    }

    const handleAvatarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        op.current?.toggle(e);
    }

    const rows = useMemo(
        () => [
            { label: `Logged in as ${userName}` },
            { label: 'Sign Out', icon: 'pi pi-sign-out', command: handleSignOut }
        ],
        [userName]
    );

    return (
        <div className="relative">
            {!userName ? (
                <Skeleton shape="circle" size="2rem"></Skeleton>
            ) : (
                <Avatar
                    label={userName.charAt(0)}
                    shape="circle"
                    className="cursor-pointer relative block"
                    onClick={handleAvatarClick}
                />
            )}

            <OverlayPanel ref={op} pt={{
                root: {
                    className: 'overlaycontrol'
                }
            }}>
                <OverlayRows model={rows} />
            </OverlayPanel>
        </div>
    );
}