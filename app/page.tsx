"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { countActivities, applyFiltersToMap, applyMilestoneFilters } from "@/lib/maphelper";
import CustomMap from "./components/CustomMap/custommap";
import ImageRadioButtons from "./components/ImageRadioButtons/imageradiobuttons";
import DetailsList from "./components/DetailsList/detailslist";

import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';
import { Toast } from 'primereact/toast';
import { BIKING, HIKING, TRAVEL } from "@/lib/constants";

export default function Home() {
  const [notionData, setNotionData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const [selectedYears, setSelectedYears] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [distanceThreshold, setDistanceThreshold] = useState(0);
  const [elevationThreshold, setElevationThreshold] = useState(0);

  const operatorOptions = [' < ', ' > '];
  const [distanceOperator, setDistanceOperator] = useState(operatorOptions[1]);
  const [elevationOperator, setElevationOperator] = useState(operatorOptions[1]);

  const [viewMilestonesBool, setViewMilestonesBool] = useState(false);

  const [detailsTitle, setDetailsTitle] = useState('Details');
  const [activeTab, setActiveTab] = useState(0);
  const [detailsContent, setDetailsContent] = useState(null);

  const toast = useRef(null);


  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  const displayInfo = (info) => {
    toast.current.show({ severity: 'info', summary: 'Info', detail: `Found ${info} activities` });
  };

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

    outdoorsData.forEach(outdoorDatum => {
outdoorDatum.activities.forEach(activity => {
      yearsForFilter.add(new Date(activity.date).getFullYear());
    });
      });

      travelData.forEach(travelDatum => {
        travelDatum.activities.forEach(activity => {
      if (activity.startDate) {
        yearsForFilter.add(new Date(activity.startDate).getFullYear());
      }
    });
      });

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
      setSelectedParticipant('both');
      setSelectedActivities([BIKING, HIKING, TRAVEL]);
    };

    fetchData();
  }, []);

  
  const updateFilterConfig = (filter) => {
    return {
      participant: filter.participant || selectedParticipant,
      years: filter.years || selectedYears,
      activityTypes: filter.activityTypes || selectedActivities,
      distance: filter.distance || { operator: distanceOperator.trim(), value: distanceThreshold },
      elevation: filter.elevation || { operator: elevationOperator.trim(), value: elevationThreshold }
    };
  };

  const onParticipantChange = (value) => {
    setSelectedParticipant(value);

    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({ participant: value }));
    const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  };

  const onYearSelectChange = (yearArray) => {
    setSelectedYears(yearArray);

    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({ years: yearArray }));
    const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  };

  const onActivitySelectChange = (e) => {
    let _selectedActivities = [...selectedActivities];

    if (e.checked)
      _selectedActivities.push(e.value);
    else
      _selectedActivities.splice(_selectedActivities.indexOf(e.value), 1);

    setSelectedActivities(_selectedActivities);

    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({ activityTypes: _selectedActivities }));
const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  };

  const onDistanceOperatorChange = (operator) => {
    setDistanceOperator(operator);

    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({ distance: { operator: operator.trim(), value: distanceOperator } }));
const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  };

  const onDistanceThresholdChange = (value) => {
    setDistanceThreshold(value);

    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({ distance: { operator: distanceOperator.trim(), value } }));
const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  };

  const onElevationOperatorChange = (operator) => {
    setElevationOperator(operator);

    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({ elevation: { operator: operator.trim(), value: elevationOperator } }));
const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  };

  const onElevationThresholdChange = (value) => {
    setElevationThreshold(value);

    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({ elevation: { operator: elevationOperator.trim(), value } }));
const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  };

const onToggleMilestonesMode = (value: true | null) => {
    setViewMilestonesBool(!!value); // set to true if true, set to false if null;

    if (value) {
      const filteredData = applyMilestoneFilters(notionData);
      setDisplayData(filteredData);
    } else {
      const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({}));
      setDisplayData(filteredData);
    }
  };

  const onMarkerClick = (event, activities, locationName) => {
    setDetailsTitle(`Details - ${locationName}`);
    setActiveTab(1);
    setDetailsContent(activities);
  };



  if (loading) {
    return <div>Loading...</div>;
  }

  if (!notionData) {
    return <div>Error fetching Notion data</div>;
  }



  return (
    <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
      <Toast ref={toast} />
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
            <Accordion activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
              <AccordionTab header="Filters">
                <ImageRadioButtons onChange={onParticipantChange} disabled={viewMilestonesBool} />
                <div className="flex flex-row mt-4">
                  <div>
                    Years:
                  </div>
                  <div>
                    <MultiSelect
value={selectedYears}
onChange={(e) => onYearSelectChange(e.value)}
                      options={yearOptions}
                      disabled={viewMilestonesBool}
optionLabel="name"
display="chip"
                      placeholder="Select Years"
className="w-full md:w-20rem" />
                  </div>
                </div>
                <div className="flex flex-row mt-4">
                  <div>
                    Activity Type:
                  </div>
                  <div className="card flex flex-wrap justify-content-center gap-3">
                    <div className="flex align-items-center">
                      <Checkbox
inputId="activity1"
name="hike"
value={HIKING}
onChange={onActivitySelectChange}
checked={selectedActivities.includes(HIKING)}
                        disabled={viewMilestonesBool}
/>
                      <Image
                        src="/malewalk.png"
                        width={36}
                        height={36}
                        alt="Hike"
title="Hike"
                      />
                      <label htmlFor="activity1" className="ml-2">Hike</label>
                    </div>
                    <div className="flex align-items-center">
                      <Checkbox
inputId="activity2"
name="bike"
value={BIKING}
onChange={onActivitySelectChange}
checked={selectedActivities.includes(BIKING)}
                        disabled={viewMilestonesBool}
/>
                      <Image
                        src="/femalebicycle.png"
                        width={36}
                        height={36}
                        alt="Bike"
title="Bike"
                      />
                      <label htmlFor="activity2" className="ml-2">Bike</label>
                    </div>
                    <div className="flex align-items-center">
                      <Checkbox
inputId="activity3"
name="travel"
value={TRAVEL}
onChange={onActivitySelectChange}
checked={selectedActivities.includes(TRAVEL)}
                        disabled={viewMilestonesBool}
/>
                      <Image
                        src="/airplane.png"
                        width={36}
                        height={36}
                        alt="Travel"
                        title="Travel"
                      />
                      <label htmlFor="activity3" className="ml-2">Travel</label>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  Distance:
                  <div className="flex flex-row">
                    <span>
                      <SelectButton
value={distanceOperator}
tooltip="Distance less than or greater than"
tooltipOptions={{ showDelay: 500, hideDelay: 300 }}
onChange={(e) => onDistanceOperatorChange(e.value)}
options={operatorOptions}
                        disabled={viewMilestonesBool}
/>
                    </span>
                    <span>
                      <InputNumber
                        value={distanceThreshold}
                        onValueChange={(e) => onDistanceThresholdChange(e.value)}
                        mode="decimal"
                        min={0}
                        useGrouping={false}
                        maxFractionDigits={1}
                        placeholder="km"
                        suffix=" km"
                        showButtons
disabled={viewMilestonesBool}
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
                  Elevation Gain:
                  <div className="flex flex-row">
                    <span>
                      <SelectButton
value={elevationOperator}
tooltip="Elevation less than or greater than"
tooltipOptions={{ showDelay: 500, hideDelay: 300 }}
onChange={(e) => onElevationOperatorChange(e.value)}
options={operatorOptions}
                        disabled={viewMilestonesBool}
/>
                    </span>
                    <span>
                      <InputNumber
                        value={elevationThreshold}
                        onValueChange={(e) => onElevationThresholdChange(e.value)}
                        mode="decimal"
                        min={0}
                        useGrouping={false}
                        maxFractionDigits={1}
                        placeholder="ft"
                        suffix=" ft"
                        showButtons
disabled={viewMilestonesBool}
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
                  <SelectButton
value={viewMilestonesBool}
onChange={(e) => onToggleMilestonesMode(e.value)}
options={[{ label: '🏆 Milestones Only', value: true }]}
/>
                </div>
              </AccordionTab>
              <AccordionTab header={detailsTitle}>
                <DetailsList activities={detailsContent} />
              </AccordionTab>
            </Accordion>
          </div>
      </div>
      <div className="md:w-2/3 2xl:flex-1 h-dvh">
        <APIProvider apiKey={apiKey}>
            <CustomMap displayData={displayData} onMarkerClick={onMarkerClick} />
        </APIProvider>
      </div>
    </div>
    </PrimeReactProvider>
  );
}
