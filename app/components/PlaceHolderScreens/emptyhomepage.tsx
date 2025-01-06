import React from "react";
import { Skeleton } from 'primereact/skeleton';
import Image from "next/image";

export default function EmptyHomePage() {

    return (<>
        <div className="md:hidden h-screen w-full flex justify-center pb-80">
            <Image
                className="self-center object-cover object-center rounded-lg flashing-image"
                src="/favicon.ico"
                width={85}
                height={85}
                alt="Logo"
                priority={true}
            />
        </div>
        <div className="hidden md:block w-full h-full">
            <div className="w-full h-16 grid justify-items-end">
                <Skeleton shape="circle" size="2.5rem" className="m-4"></Skeleton>
            </div>
            <div className="flex h-[calc(100vh-4rem)] p-4">
                <div className="md:w-1/4 2xl:w-128 h-full px-4">
                    <div className="flex flex-row justify-between">
                        <Skeleton shape="circle" size="4rem" className="m-4"></Skeleton>
                        <Skeleton shape="circle" size="4rem" className="m-4"></Skeleton>
                        <Skeleton shape="circle" size="4rem" className="m-4"></Skeleton>
                    </div>

                    <Skeleton height="2.5rem" className="mt-10" />
                    <Skeleton width="75%"></Skeleton>
                    <Skeleton width="50%"></Skeleton>

                    <Skeleton height="2.5rem" className="mt-10" />
                    <Skeleton width="75%"></Skeleton>
                    <Skeleton width="50%"></Skeleton>

                    <Skeleton height="2.5rem" className="mt-10" />
                    <Skeleton height="2.5rem" className="mt-10" />
                </div>
                <div className="md:w-3/4 2xl:flex-1 pl-4">
                    <Skeleton height="100%" className="" />
                </div>
            </div>
        </div>
    </>
    );
    // return (

    // );
}