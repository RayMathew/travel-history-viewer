import React from "react";
import Image from "next/image";
// import worldMarker from 

export default function EmptyDetailsPanel() {
    return (
        <div className="h-full w-full relative">
            <div className="absolute top-[15%] w-full text-center text-2xl">
                Click on a map marker to view a memory
            </div>
            <div className="w-full h-full bottom-[-15%] absolute">
                <Image
                    className='w-full h-full'
                    alt="Activity Image"
                    fill={true}
                    src="/markerimage.svg"
                />
            </div>
        </div>
    );
}