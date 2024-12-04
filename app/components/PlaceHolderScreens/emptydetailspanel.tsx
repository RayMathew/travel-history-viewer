import React from "react";
import Image from "next/image";
// import worldMarker from 

export default function EmptyDetailsPanel() {
    return (
        <div className="h-full w-full relative flex flex-col">
            <div className=" w-full text-center text-2xl pt-8">
                Click on a map marker to view a memory
            </div>
            <div className="w-full flex-grow relative">
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