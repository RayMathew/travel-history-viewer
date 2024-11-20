import React, { useEffect } from "react";
import Image from "next/image";
import {
    AdvancedMarker,
    Map,
    useMap,
    // CollisionBehavior,
} from "@vis.gl/react-google-maps";
import { getActivityImgSrc } from "@/lib/maphelper";

const MarkerWithInfoWindow = ({ activityData, position }) => {
    // const [markerRef, marker] = useAdvancedMarkerRef();
    // const infoWindowRef = useRef(null);

    // const [infoWindowShown, setInfoWindowShown] = useState(false);

    // const handleMarkerClick = useCallback(
    //   (moo, activityData, mark) => {
    //     setInfoWindowShown(isShown => !isShown);
    //     console.log("moo", moo, "activityData", infoWindowRef)
    //   },
    //   []
    // );

    // if the maps api closes the infowindow, we have to synchronize our state
    // const handleClose = useCallback(() => setInfoWindowShown(false), []);

    return (
        <>
            <AdvancedMarker
                // ref={markerRef}
                // onClick={(event) => handleMarkerClick(event, activityData)}
                position={position}
                title={activityData.name}
            // collisionBehavior={CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY}
            >
                <Image
                    src={getActivityImgSrc(activityData)}
                    width={36}
                    height={36}
                    alt={activityData.type}
                />
            </AdvancedMarker>
            {/* {infoWindowShown && (
          <InfoWindow anchor={marker} ref={infoWindowRef} onClose={handleClose} className="property">
            <h2>InfoWindow content!</h2>
            <p>{activityData.name}</p>
          </InfoWindow>

        )} */}
        </>
    );
};

export default function CustomMap({ displayData }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !displayData) return;
        const bounds = new window.google.maps.LatLngBounds();
        const { outdoorsData, travelData } = displayData;
        console.log(displayData);

        
        for (var i = 0; i < outdoorsData.length; i++) {
            bounds.extend(
                new window.google.maps.LatLng(
                    outdoorsData[i].coordinates.lat,
                    outdoorsData[i].coordinates.lng
                )
            );
                    }
        for (var i = 0; i < travelData.length; i++) {
            for (var k = 0; k < travelData[i].coordinatesArray.length; k++) {
                bounds.extend(
                    new window.google.maps.LatLng(
                        travelData[i].coordinatesArray[k].lat,
                        travelData[i].coordinatesArray[k].lng
                    )
                );
            }
                    }

        map.fitBounds(bounds);

    }, [map, displayData]);

    return (
        <Map
            mapId="DEMO"
            defaultZoom={2}
            defaultCenter={{ lat: 5.145259, lng: -27.8719489 }}
            mapTypeControl={false}
            streetViewControl={false}
        >
            {displayData.outdoorsData.map((activityData, index) => {

                return (
                    <MarkerWithInfoWindow
                        key={index}
                        activityData={activityData}
                        position={{
                            lat: activityData.coordinates.lat,
                            lng: activityData.coordinates.lng,
                        }}
                    />
                );
            })}
            {displayData.travelData.map((activityData) => {
                return activityData.coordinatesArray.map((coordinatesObj, index) => {
                    return (
                        <MarkerWithInfoWindow
                            key={index}
                            activityData={activityData}
                            position={{ lat: coordinatesObj.lat, lng: coordinatesObj.lng }}
                        />
                    );
                });
            })}
        </Map>
    );
};