import React, { useMemo, useRef } from "react";
import { Avatar } from 'primereact/avatar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Menu as OverlayRows } from 'primereact/menu';
import { Skeleton } from 'primereact/skeleton';
import { useSession } from 'next-auth/react';
import { logout } from "@/lib/actions";
// import anime from 'animejs';


export default function NavbarAvatar() {
    const op = useRef<OverlayPanel>(null);

    const { data } = useSession();

    const userName: string = data?.user?.name || '';

    const handleSignOut = () => {
        localStorage.clear();
        logout();
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

            <OverlayPanel ref={op}>
                <OverlayRows model={rows} />
            </OverlayPanel>
        </div>
    );
}