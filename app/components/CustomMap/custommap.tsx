import React, { useEffect } from "react";
import Image from "next/image";
import {
    AdvancedMarker,
    Map,
    useMap,
    // CollisionBehavior,
} from "@vis.gl/react-google-maps";
import { getActivityImgSrc } from "@/lib/maphelper";

const MarkerWithInfoWindow = ({ activityData, name, position }) => {
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
                title={name}
            // collisionBehavior={CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY}
            >
                <Image
                    src={getActivityImgSrc(activityData[0])}
                    width={36}
                    height={36}
                    alt={activityData[0].type}
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
    console.log('rerender map', displayData)

    useEffect(() => {
        if (!map || !displayData) return;

        const bounds = new window.google.maps.LatLngBounds();
        const { outdoorsData, travelData } = displayData;
        console.log(displayData);

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
                    activityData={location.activities}
                    name={location.name}
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
            streetViewControl={false}
        // key={JSON.stringify(displayData)}
        >
            {renderMarkers(displayData.outdoorsData)}
            {renderMarkers(displayData.travelData)}
        </Map>
    );
};