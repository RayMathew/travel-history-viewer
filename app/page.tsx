// import Image from "next/image";
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import { AdvancedMarker, APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { RAY, NAMRATA, HIKING, BIKING, TRAVEL } from '../lib/constants';

export default function Home() {
  const [notionData, setNotionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('API key is not defined. Please set the NEXT_PUBLIC_API_KEY environment variable.');
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/notion');
        const data = await response.json();
        setNotionData(data);
        // console.log(data);
      } catch (error) {
        console.error('Error fetching data from Notion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!notionData) return;


  }, [notionData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!notionData) {
    return <div>Error fetching Notion data</div>;
  }

  const CustomMap = () => {
    const map = useMap();

    const getActivityImgSrc = activityData => {
      if (activityData.type == TRAVEL) return '/airplane.png';

      if (activityData.doneBy.includes(RAY)) {
        if (activityData.type == HIKING) return '/malewalk.png';
        return '/malebicycle.png';
      }

      else if (activityData.type == HIKING) return '/femalewalk.png';
      return '/femalebicycle.png';
    }

    useEffect(() => {
      if (!map || !notionData) return;
      let bounds = new window.google.maps.LatLngBounds();

      const { outdoorsData, travelData } = notionData;
      for (var i = 0; i < outdoorsData.length; i++) {
        bounds.extend(new window.google.maps.LatLng(outdoorsData[i].coordinates.lat, outdoorsData[i].coordinates.lng));
      }
      for (var i = 0; i < travelData.length; i++) {
        for (var k = 0; k < travelData[i].coordinatesArray.length; k++) {
          bounds.extend(new window.google.maps.LatLng(travelData[i].coordinatesArray[k].lat, travelData[i].coordinatesArray[k].lng));
        }
      }

      map.fitBounds(bounds);
    }, [map]);

    return (
      <Map mapId="DEMO" mapTypeControl={false} streetViewControl={false}>
        {notionData.outdoorsData.map((activityData, index) => {
          return (<AdvancedMarker key={index} position={{ lat: activityData.coordinates.lat, lng: activityData.coordinates.lng }}>
            <Image
              src={getActivityImgSrc(activityData)}
              width={36}
              height={36}
              alt={activityData.type}
            />
          </AdvancedMarker>)
        })}
        {notionData.travelData.map((activityData) => {
          return activityData.coordinatesArray.map((coordinatesObj, index) => {
            return (<AdvancedMarker key={index} position={{ lat: coordinatesObj.lat, lng: coordinatesObj.lng }}>
              <Image
                src={getActivityImgSrc(activityData)}
                width={36}
                height={36}
                alt={activityData.type}
              />
            </AdvancedMarker>)
          })
        })}
      </Map>
    );
  };


  return (
    <div className='flex'>
      <div className='md:w-1/3 2xl:w-128'>
        {/* <a href="https://www.flaticon.com/free-icons/travel" title="travel icons">Travel icons created by Freepik - Flaticon</a> */}
        <div className='w-full flex h-20'>
          <div className='flex-1 flex'>
            <Image
              className='mx-3 self-center'
              src="/stats.png"
              width={44}
              height={44}
              alt="Go to stats page"
            />
          </div>
          <div className='flex-1'></div>
        </div>
      </div>
      <div className="md:w-2/3 2xl:flex-1 h-dvh">
        <APIProvider apiKey={apiKey}>
          <CustomMap />
        </APIProvider>
      </div>
    </div>
  )
  // return (
  //   <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
  //     <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
  //       <Image
  //         className="dark:invert"
  //         src="/next.svg"
  //         alt="Next.js logo"
  //         width={180}
  //         height={38}
  //         priority
  //       />
  //       <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
  //         <li className="mb-2">
  //           Get started by editing{" "}
  //           <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
  //             app/page.tsx
  //           </code>
  //           .
  //         </li>
  //         <li>Save and see your changes instantly.</li>
  //       </ol>

  //       <div className="flex gap-4 items-center flex-col sm:flex-row">
  //         <a
  //           className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
  //           href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           <Image
  //             className="dark:invert"
  //             src="/vercel.svg"
  //             alt="Vercel logomark"
  //             width={20}
  //             height={20}
  //           />
  //           Deploy now
  //         </a>
  //         <a
  //           className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
  //           href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           Read our docs
  //         </a>
  //       </div>
  //     </main>
  //     <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
  //       <a
  //         className="flex items-center gap-2 hover:underline hover:underline-offset-4"
  //         href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         <Image
  //           aria-hidden
  //           src="/file.svg"
  //           alt="File icon"
  //           width={16}
  //           height={16}
  //         />
  //         Learn
  //       </a>
  //       <a
  //         className="flex items-center gap-2 hover:underline hover:underline-offset-4"
  //         href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         <Image
  //           aria-hidden
  //           src="/window.svg"
  //           alt="Window icon"
  //           width={16}
  //           height={16}
  //         />
  //         Examples
  //       </a>
  //       <a
  //         className="flex items-center gap-2 hover:underline hover:underline-offset-4"
  //         href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         <Image
  //           aria-hidden
  //           src="/globe.svg"
  //           alt="Globe icon"
  //           width={16}
  //           height={16}
  //         />
  //         Go to nextjs.org →
  //       </a>
  //     </footer>
  //   </div>
  // );
}
