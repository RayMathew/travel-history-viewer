"use client";

import { PrimeReactProvider } from "primereact/api";
import Tailwind from 'primereact/passthrough/tailwind';
import Image from "next/image";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { getActivityImgSrc, applyFiltersToMap } from "@/lib/maphelper";

export default function Home() {
  const [notionData, setNotionData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/notion");
        const data = await response.json();
        setNotionData(data);

        const filteredData = applyFiltersToMap(true, data);
        setDisplayData(filteredData);
      } catch (error) {
        console.error("Error fetching data from Notion:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!notionData) {
    return <div>Error fetching Notion data</div>;
  }

  const MarkerWithInfoWindow = ({ activityData, position }) => {
    const [markerRef, marker] = useAdvancedMarkerRef();

    const [infoWindowShown, setInfoWindowShown] = useState(false);

    const handleMarkerClick = useCallback(
      () => setInfoWindowShown(isShown => !isShown),
      []
    );

    // if the maps api closes the infowindow, we have to synchronize our state
    const handleClose = useCallback(() => setInfoWindowShown(false), []);

    return (
      <>
        <AdvancedMarker
          ref={markerRef}
          onClick={handleMarkerClick}
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
        {infoWindowShown && (
          <InfoWindow anchor={marker} onClose={handleClose}>
            <h2>InfoWindow content!</h2>
            <p>{activityData.name}</p>
          </InfoWindow>

        )}
      </>
    );
  };

  const CustomMap = () => {
    const map = useMap();

    useEffect(() => {
      if (!map || !notionData || !displayData) return;
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
    }, [map]);

    return (
      <Map
        mapId="DEMO"
        defaultZoom={2}
        defaultCenter={{ lat: 23.468, lng: 10.872 }}
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

  return (
    <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
    <div className="flex">
      <div className="md:w-1/3 2xl:w-128">
        {/* <a href="https://www.flaticon.com/free-icons/travel" title="travel icons">Travel icons created by Freepik - Flaticon</a> */}
        <div className="w-full flex h-20">
          <div className="flex-1 flex">
            <Image
              className="mx-3 self-center"
              src="/stats.png"
              width={44}
              height={44}
              alt="Go to stats page"
              priority={false}
            />
          </div>
          <div className="flex-1"></div>
        </div>
      </div>
      <div className="md:w-2/3 2xl:flex-1 h-dvh">
        <APIProvider apiKey={apiKey}>
          <CustomMap />
        </APIProvider>
      </div>
    </div>
    </PrimeReactProvider>
  );
}
