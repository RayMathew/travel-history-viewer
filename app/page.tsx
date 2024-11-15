"use client";

import React, { useEffect, useState } from "react";
import { PrimeReactProvider } from "primereact/api";
import Tailwind from 'primereact/passthrough/tailwind';
import 'primeicons/primeicons.css';
import Image from "next/image";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { applyFiltersToMap } from "@/lib/maphelper";
import CustomMap from "./components/CustomMap/custommap";
import ImageRadioButtons from "./components/ImageRadioButtons/imageradiobuttons";

import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';

export default function Home() {
  const [notionData, setNotionData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [participant, setParticipant] = useState(null);

  const [selectedYears, setSelectedYears] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [distanceThreshold, setDistanceThreshold] = useState(null);
  const [elevationThreshold, setElevationThreshold] = useState(null);

  const operatorOptions = [' < ', ' > '];
  const [distanceOperator, setDistanceOperator] = useState(operatorOptions[0]);
  const [elevationOperator, setElevationOperator] = useState(operatorOptions[0]);

  const [viewMilestonesBool, setViewMilestonesBool] = useState(null);


  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/notion");
        const data = await response.json();
        setNotionData(data);
        setupData(data);

        const initialfilteredData = applyFiltersToMap(true, data);
        setDisplayData(initialfilteredData);
      } catch (error) {
        console.error("Error fetching data from Notion:", error);
      } finally {
        setLoading(false);
      }
    };

    const setupData = (initialData) => {
      const { outdoorsData, travelData } = initialData;
    const yearsForFilter = new Set();

    for (var i = 0; i < outdoorsData.length; i++) {
      yearsForFilter.add(new Date(outdoorsData[i].date).getFullYear());
    }
    for (var i = 0; i < travelData.length; i++) {
      if (travelData[i].startDate) {
        yearsForFilter.add(new Date(travelData[i].startDate).getFullYear());
      }
    }
    const filterYearsArray = Array.from(yearsForFilter);
    filterYearsArray.sort();

    const temp = filterYearsArray.map(year => {
      return {
        name: year,
        value: year,
      }
    })
    setYearOptions(temp);
    setSelectedYears([filterYearsArray[filterYearsArray.length - 1]]);
      setParticipant('both');
      setSelectedActivities([BIKING, HIKING, TRAVEL]);
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   if (!displayData) return;

  // }, [displayData]);

  const onYearSelectChange = (yearArray) => {
    setSelectedYears(yearArray);
    const filteredData = applyFiltersToMap(false, notionData, {
      years: yearArray,
      participant,
      activityTypes: selectedActivities
    });
    setDisplayData(filteredData);
  };

  const onActivitySelectChange = (e) => {
    let _selectedActivities = [...selectedActivities];

    if (e.checked)
      _selectedActivities.push(e.value);
    else
      _selectedActivities.splice(_selectedActivities.indexOf(e.value), 1);

    setSelectedActivities(_selectedActivities);
  }


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
          <div>
            <Accordion activeIndex={0}>
              <AccordionTab header="Filters">
                {/* <div className="flex flex-wrap gap-3">
                  <div className="flex align-items-center">
                    <RadioButton inputId="participant1" name="ray" value="Ray" onChange={(e) => setParticipant(e.value)} checked={participant === 'Ray'} >
                      <Image
                        src="/airplane.png"
                        width={36}
                        height={36}
                        alt='asda'
                      />
                    </RadioButton>
                    <label htmlFor="participant1" className="ml-2">Ray</label>
                  </div>
                  <div className="flex align-items-center">
                    <RadioButton inputId="participant2" name="namrata" value="Namrata" onChange={(e) => setParticipant(e.value)} checked={participant === 'Namrata'} />
                    <label htmlFor="participant2" className="ml-2">Namrata</label>
                  </div>
                  <div className="flex align-items-center">
                    <RadioButton inputId="bothparticipants" name="both" value="Both" onChange={(e) => setParticipant(e.value)} checked={participant === 'Both'} />
                    <label htmlFor="bothparticipants" className="ml-2">Both</label>
                  </div>
                </div> */}
                <ImageRadioButtons onChange={setParticipant} />
                <div className="flex flex-row mt-4">
                  <div>
                    Years:
                  </div>
                  <div>
                    <MultiSelect value={selectedYears} onChange={(e) => {
                      console.log('asfas', e.value)
                      setSelectedYears(e.value)
                    }} options={yearOptions} optionLabel="name" display="chip"
                      placeholder="Select Years" className="w-full md:w-20rem" />
                  </div>
                </div>
                <div className="flex flex-row mt-4">
                  <div>
                    Activity Type:
                  </div>
                  <div className="card flex flex-wrap justify-content-center gap-3">
                    <div className="flex align-items-center">
                      <Checkbox inputId="activity1" name="hike" value="Hike" onChange={onActivitySelectChange} checked={selectedActivities.includes('Hike')} />
                      <Image
                        src="/malewalk.png"
                        width={36}
                        height={36}
                        alt="Hike"
                      />
                      <label htmlFor="activity1" className="ml-2">Hike</label>
                    </div>
                    <div className="flex align-items-center">
                      <Checkbox inputId="activity2" name="bike" value="Bike" onChange={onActivitySelectChange} checked={selectedActivities.includes('Bike')} />
                      <Image
                        src="/femalebicycle.png"
                        width={36}
                        height={36}
                        alt="Bike"
                      />
                      <label htmlFor="activity2" className="ml-2">Bike</label>
                    </div>
                    <div className="flex align-items-center">
                      <Checkbox inputId="activity3" name="travel" value="Travel" onChange={onActivitySelectChange} checked={selectedActivities.includes('Travel')} />
                      <Image
                        src="/airplane.png"
                        width={36}
                        height={36}
                        alt="travel"
                      />
                      <label htmlFor="activity3" className="ml-2">Travel</label>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  Distance:
                  <div className="flex flex-row">
                    <span>
                      <SelectButton value={distanceOperator} tooltip="Distance less than or greater than" tooltipOptions={{ showDelay: 500, hideDelay: 300 }} onChange={(e) => setDistanceOperator(e.value)} options={operatorOptions} />
                    </span>
                    <span>
                      <InputNumber
                        value={distanceThreshold}
                        onValueChange={(e) => setDistanceThreshold(e.value)}
                        mode="decimal"
                        min={0}
                        useGrouping={false}
                        maxFractionDigits={1}
                        placeholder="km"
                        suffix=" km"
                        showButtons
                        // buttonLayout="vertical"
                        // decrementButtonClassName="p-button-secondary"
                        // incrementButtonClassName="p-button-secondary"
                        // incrementButtonIcon="pi pi-plus"
                        // decrementButtonIcon="pi pi-minus"
                        pt={{
                          input: {
                            root: {
                              className: 'max-w-24',
                            },

                          },
                        }}
                      />
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  Elevation:
                  <div className="flex flex-row">
                    <span>
                      <SelectButton value={elevationOperator} tooltip="Elevation less than or greater than" tooltipOptions={{ showDelay: 500, hideDelay: 300 }} onChange={(e) => setElevationOperator(e.value)} options={operatorOptions} />
                    </span>
                    <span>
                      <InputNumber
                        value={elevationThreshold}
                        onValueChange={(e) => setElevationThreshold(e.value)}
                        mode="decimal"
                        min={0}
                        useGrouping={false}
                        maxFractionDigits={1}
                        placeholder="km"
                        suffix=" km"
                        showButtons
                        // buttonLayout="vertical"
                        // decrementButtonClassName="p-button-secondary"
                        // incrementButtonClassName="p-button-secondary"
                        // incrementButtonIcon="pi pi-plus"
                        // decrementButtonIcon="pi pi-minus"
                        pt={{
                          input: {
                            root: {
                              className: 'max-w-24',
                            },

                          },
                        }}
                      />
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <SelectButton value={viewMilestonesBool} onChange={(e) => setViewMilestonesBool(e.value)} options={['🏆 Milestones Only']} />
                </div>
              </AccordionTab>
              <AccordionTab header="Details">
                <p className="m-0">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                  quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas
                  sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                  Consectetur, adipisci velit, sed quia non numquam eius modi.
                </p>
              </AccordionTab>
            </Accordion>
          </div>
      </div>
      <div className="md:w-2/3 2xl:flex-1 h-dvh">
        <APIProvider apiKey={apiKey}>
            <CustomMap displayData={displayData} />
        </APIProvider>
      </div>
    </div>
    </PrimeReactProvider>
  );
}
