import React, { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import {
    AdvancedMarker,
    Map,
    useMap,
    ColorScheme,
    InfoWindow,
    useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { getActivityImgSrc } from "@/lib/maphelper";
import useIsMobile from "@/hooks/useIsMobile";
import { CustomMapProps, MarkerWithInfoWindowProps } from "@/lib/types/frontend";
import { OutdoorsData, TravelData } from "@/lib/types/shared";
const DetailsList = React.lazy(() => import("../DetailsList/detailslist"));

const MarkerWithInfoWindow = ({
    activities,
    locationName,
    position,
    onMarkerClick,
    isMobile,
    isMilestoneMode,
    isOpen,
    onOpen,
    onClose
}: MarkerWithInfoWindowProps) => {
    const [markerRef, marker] = useAdvancedMarkerRef();
    // const [animateClass, setAnimateClass] = useState("");

    const mobileOrDesktopClick = (event: google.maps.MapMouseEvent) => {
        if (isMobile) {
            handleMobileMarkerClick();
        } else {
            onMarkerClick(event, activities, locationName)
        }
    };

    const handleMobileMarkerClick = useCallback(
        () => {
            if (isOpen) {
                onClose(); // Close if already open
            } else {
                onOpen(); // Open this marker
            }
        },
        []
    );

    // hacky code to animate PrimeReact lib's Infowindow.
    // div[role="dialog"] initially does not exist, so we keep waiting for it to exist after the user taps on the marker. 
    // Once it exists, access it and animate it.
    useEffect(() => {
        if (isOpen) {
            let retries = 0;
            const interval = setInterval(() => {
                const dialogElement = document.querySelector('div[role="dialog"]');
                if (dialogElement) {
                    dialogElement.classList.add("info-window-animation");
                    clearInterval(interval); // Stop checking once found
                }

                retries++;
                if (retries > 10) {
                    clearInterval(interval);
                }
            }, 50);

            return () => {
                clearInterval(interval);
                const dialogElement = document.querySelector('div[role="dialog"]');
                if (dialogElement) {
                    dialogElement.classList.remove("info-window-animation");
                }
            };
        }
    }, [isOpen]);

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                onClick={mobileOrDesktopClick}
                position={position}
                title={locationName}
            >
                <Image
                    src={getActivityImgSrc(activities![0])}
                    width={50}
                    height={50}
                    alt={activities![0].type}
                />
            </AdvancedMarker>
            {isOpen && (
                <InfoWindow anchor={marker} headerContent={<h2 className="ml-4">{locationName}</h2>}
                    onClose={onClose} className="dark:!bg-[#121212] text-base w-[calc(100vw)]">
                    <DetailsList
                        activities={activities}
                        milestoneMode={isMilestoneMode}
                    />
                </InfoWindow>
            )}
        </>
    );
};

export default function CustomMap({ displayData, onMarkerClick, isMilestoneMode }: CustomMapProps) {
    const map = useMap();
    const isMobile = useIsMobile();
    const [openMarkerId, setOpenMarkerId] = useState<string | null>(null);
    // console.log('rerender map', displayData)

    useEffect(() => {
        if (!map || !displayData) return;

        const bounds = new window.google.maps.LatLngBounds();
        const { outdoorsData, travelData } = displayData;

        const extendBounds = (data: OutdoorsData[] | TravelData[]) => {
            for (var i = 0; i < data.length; i++) {
                bounds.extend(
                    new window.google.maps.LatLng(
                        data[i].coordinates.lat,
                        data[i].coordinates.lng
                    )
                );
            }
        };

        if (outdoorsData.length || travelData.length) {
            extendBounds(outdoorsData);
            extendBounds(travelData);
        }
        else {
            bounds.extend(new window.google.maps.LatLng(0, 0))
        }

        map.fitBounds(bounds);

    }, [map, displayData]);

    const handleMarkerClick = (markerId: string | null) => {
        // if the same marker is clicked again, set it to null to close it and indicate all markers are closed. Else set a new marker is open in place of the old.
        setOpenMarkerId((prevId) => (prevId === markerId ? null : markerId));
    };

    const renderMarkers = (identifier: string, markerData: OutdoorsData[] | TravelData[]) => {
        return markerData.map((location, index) => {
            if (!location.coordinates) return null;
            return (
                <MarkerWithInfoWindow
                    key={index}
                    isMobile={isMobile}
                    onMarkerClick={onMarkerClick}
                    activities={location.activities}
                    locationName={location.locationName}
                    isMilestoneMode={isMilestoneMode}
                    position={{
                        lat: location.coordinates.lat,
                        lng: location.coordinates.lng,
                    }}
                    isOpen={openMarkerId === `${identifier}${index}`}
                    onOpen={() => handleMarkerClick(`${identifier}${index}`)}
                    onClose={() => handleMarkerClick(null)}
                />
            );
        })
    };

    if (!displayData) return null;

    return (
        <Map
            mapId="memoirmap"
            defaultZoom={2}
            defaultCenter={{ lat: 5.145259, lng: -27.8719489 }}
            mapTypeControl={false}
            mapTypeId={'terrain'}
            streetViewControl={false}
            fullscreenControl={false}
            colorScheme={ColorScheme.DARK}
        >
            {renderMarkers('outdoors', displayData.outdoorsData)}
            {renderMarkers('travel', displayData.travelData)}
        </Map>
    );
};