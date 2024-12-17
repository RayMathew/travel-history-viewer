import React, { useRef } from "react";
import { Avatar } from 'primereact/avatar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Menu as OverlayRows } from 'primereact/menu';
import { Skeleton } from 'primereact/skeleton';
import { useSession } from 'next-auth/react';
import { logout } from "@/lib/actions";
// import anime from 'animejs';


export default function NavbarAvatar() {
    const { data } = useSession();

    const userName: string = data?.user?.name ?? '';

    const rows = [
        {
            label: `Logged in as ${userName}`,
        },
        {
            label: 'Sign Out',
            icon: 'pi pi-sign-out',
            command: () => {
                localStorage.clear();
                logout();
            }
        }
    ];


    const op = useRef(null);


    return (
        <div className="relative">
            {userName == '' && (
                <Skeleton shape="circle" size="2rem"></Skeleton>
            )}
            {userName !== '' && (
                <Avatar
                    label={userName.charAt(0)}
                    shape="circle"
                    className="cursor-pointer relative block"
                    onClick={(e) => op.current.toggle(e)}
                />
            )}

            <OverlayPanel ref={op}>
                <OverlayRows model={rows} />
            </OverlayPanel>
        </div>
    );
}