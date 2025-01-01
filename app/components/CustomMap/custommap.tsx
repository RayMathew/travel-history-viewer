import React, { useEffect, useRef, useCallback, useState } from "react";
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
const DetailsList = React.lazy(() => import("../DetailsList/detailslist"));

const MarkerWithInfoWindow = ({ activities, locationName, position, onMarkerClick, isMobile }) => {
    const [markerRef, marker] = useAdvancedMarkerRef();
    // const infoWindowRef = useRef(null);

    const [infoWindowShown, setInfoWindowShown] = useState(false);
    // const [animateClass, setAnimateClass] = useState("");

    const handleMobileMarkerClick = useCallback(
        () => {
            setInfoWindowShown(isShown => !isShown);
        },
        []
    );

    // if the maps api closes the infowindow, we have to synchronize our state
    const handleClose = useCallback(() => {
        setInfoWindowShown(false);
        // setAnimateClass("");
    }, []);

    useEffect(() => {
        if (infoWindowShown) {
            let retries = 0;
            const interval = setInterval(() => {
                const dialogElement = document.querySelector('div[role="dialog"]');
                if (dialogElement) {
                    dialogElement.classList.add("info-window-animation");
                    clearInterval(interval); // Stop checking once found
                }

                retries++;
                if (retries > 10) {
                    clearInterval(interval); // Stop trying after 10 attempts (~500ms)
                }
            }, 50); // Check every 50ms

            return () => {
                clearInterval(interval); // Ensure cleanup if `infoWindowShown` changes
                const dialogElement = document.querySelector('div[role="dialog"]');
                if (dialogElement) {
                    dialogElement.classList.remove("info-window-animation");
                }
            };
        }
    }, [infoWindowShown]);

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                onClick={(event) => {
                    if (isMobile) {
                        handleMobileMarkerClick();
                    } else {
                        onMarkerClick(event, activities, locationName)
                    }
                }}
                position={position}
                title={locationName}
            >
                <Image
                    src={getActivityImgSrc(activities[0])}
                    width={50}
                    height={50}
                    alt={activities[0].type}
                />
            </AdvancedMarker>
            {infoWindowShown && (
                <InfoWindow anchor={marker} headerContent={<h2>InfoWindow content!</h2>}
                    onClose={handleClose} className="bg-gray-900 p-4">
                    <DetailsList
                        activities={activities}
                        milestoneMode={viewMilestonesBool}
                        distanceUnit={unitOfDistance}
                        setDetailsInnerShadows={setDetailsInnerShadows}
                    />

                </InfoWindow>

            )}
        </>
    );
};

export default function CustomMap({ displayData, onMarkerClick }) {
    const map = useMap();
    const isMobile = useIsMobile();
    console.log('rerender map', displayData)

    useEffect(() => {
        if (!map || !displayData) return;

        const bounds = new window.google.maps.LatLngBounds();
        const { outdoorsData, travelData } = displayData;

        const extendBounds = (data) => {
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

    const renderMarkers = (markerData) => {
        return markerData.map((location, index) => {
            if (!location.coordinates) return null;
            return (
                <MarkerWithInfoWindow
                    key={index}
                    isMobile={isMobile}
                    onMarkerClick={onMarkerClick}
                    activities={location.activities}
                    locationName={location.locationName}
                    position={{
                        lat: location.coordinates.lat,
                        lng: location.coordinates.lng,
                    }}
                />
            );
        })
    };

    return (
        <Map
            mapId="DEMO"
            defaultZoom={2}
            defaultCenter={{ lat: 5.145259, lng: -27.8719489 }}
            mapTypeControl={false}
            mapTypeId={'terrain'}
            streetViewControl={false}
            fullscreenControl={false}
            colorScheme={ColorScheme.DARK}
        // key={JSON.stringify(displayData)}
        >
            {renderMarkers(displayData.outdoorsData)}
            {renderMarkers(displayData.travelData)}
        </Map>
    );
};