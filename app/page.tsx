"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  APIProvider,
  // useMap,
  // InfoWindow,
  // useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import debounce from 'lodash.debounce';
import AuthProvider from "./components/AuthProvider/authprovider";
import CustomMap from "./components/CustomMap/custommap";
import ImageRadioButtons from "./components/ImageRadioButtons/imageradiobuttons";
import Navbar from "./components/Navbar/navbar";
import ImageWithCheckBox from "./components/ImageWithCheckBox/imagewithcheckbox";
import ThresholdFilter from "./components/ThresholdFilter/thresholdfilter";
const DetailsList = React.lazy(() => import("./components/DetailsList/detailslist"));
import { PrimeReactProvider } from "primereact/api";
import EmptyHomePage from "./components/PlaceHolderScreens/emptyhomepage";
import 'primeicons/primeicons.css';
import Tailwind from 'primereact/passthrough/tailwind';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { SelectButton } from 'primereact/selectbutton';
import { Toast } from 'primereact/toast';
import { useIntersectionObserver } from 'primereact/hooks';

import { countActivities, applyFiltersToMap, applyMilestoneFilters } from "@/lib/maphelper";
import { BIKING, HIKING, TRAVEL, SECTIONS } from "@/lib/constants";
import { Operator, YearOption } from "@/lib/types/frontend";

export default function Home() {
  const [notionData, setNotionData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [unitOfDistance, setUnitOfDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [yearOptions, setYearOptions] = useState<YearOption[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [distanceThreshold, setDistanceThreshold] = useState<number>(0);
  const [elevationThreshold, setElevationThreshold] = useState<number>(0);

  const operatorOptions: Operator[] = [' < ', ' > '];
  const [distanceOperator, setDistanceOperator] = useState<Operator>(operatorOptions[1]);
  const [elevationOperator, setElevationOperator] = useState<Operator>(operatorOptions[1]);

  const [viewMilestonesBool, setViewMilestonesBool] = useState(false);

  const [detailsTitle, setDetailsTitle] = useState('Details');
  const [detailsTitleClass, setDetailsTitleClass] = useState('');
  const [activeTab, setActiveTab] = useState(SECTIONS.FILTER_SECTION);
  const [detailsContent, setDetailsContent] = useState(null);

  const toast = useRef(null);

  const [filterInnerShadows, setFilterInnerShadows] = useState('custom-bottom-inner-shadow');
  const filterPanelTopRef = useRef(null);
  const filterPanelTopVisible = useIntersectionObserver(filterPanelTopRef);
  const filterPanelBottomRef = useRef(null);
  const filterPanelBottomVisible = useIntersectionObserver(filterPanelBottomRef);

  const [detailsInnerShadows, setDetailsInnerShadows] = useState('custom-bottom-inner-shadow');



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
      const { outdoorsData, travelData, distanceUnit } = initialData;

      setUnitOfDistance(distanceUnit);

      const yearsForFilter = new Set<number>();

      outdoorsData.forEach(outdoorDatum => {
        outdoorDatum.activities.forEach(activity => {
          yearsForFilter.add(new Date(activity.date).getFullYear());
        });
      });

      travelData.forEach(travelDatum => {
        travelDatum.activities.forEach(activity => {
          if (activity.startDate && activity.travelStatus !== 'Idea') {
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

  useEffect(() => {
    if (filterPanelTopVisible) {
      setFilterInnerShadows('custom-bottom-inner-shadow');
    } else if (filterPanelBottomVisible) {
      setFilterInnerShadows('custom-top-inner-shadow');
    }
    else if (!filterPanelTopVisible && !filterPanelBottomVisible) {
      setFilterInnerShadows('custom-top-bottom-inner-shadow');
    }
  }, [filterPanelTopVisible, filterPanelBottomVisible]);

  const updateUIAndFilter = (filterUpdates) => {
    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig(filterUpdates));
    const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  };


  const updateFilterConfig = (filter) => {
    return {
      participant: filter.participant || selectedParticipant,
      years: filter.years || selectedYears,
      activityTypes: filter.activityTypes || selectedActivities,
      distance: filter.distance || { operator: distanceOperator.trim(), value: distanceThreshold },
      elevation: filter.elevation || { operator: elevationOperator.trim(), value: elevationThreshold }
    };
  };

  const onParticipantChange = (value: string) => {
    setSelectedParticipant(value);

    updateUIAndFilter({ participant: value })
  };

  const onYearSelectChange = (yearArray: number[]) => {
    setSelectedYears(yearArray);

    updateUIAndFilter({ years: yearArray })
  };

  const onActivitySelectChange = (e) => {
    const _selectedActivities = [...selectedActivities];

    if (e.checked)
      _selectedActivities.push(e.value);
    else
      _selectedActivities.splice(_selectedActivities.indexOf(e.value), 1);

    setSelectedActivities(_selectedActivities);

    updateUIAndFilter({ activityTypes: _selectedActivities });
  };

  const onDistanceOperatorChange = (operator: Operator) => {
    setDistanceOperator(operator);

    updateUIAndFilter({ distance: { operator: operator.trim(), value: distanceOperator } });
  };

  const onElevationOperatorChange = (operator: Operator) => {
    setElevationOperator(operator);

    updateUIAndFilter({ elevation: { operator: operator.trim(), value: elevationOperator } });
  };

  const debouncedUpdateMetricFilter = debounce((key: string, value: number, operator: Operator, updateState, updateFn) => {
    updateState(value);
    updateFn({ [key]: { operator: operator.trim(), value } });
  }, 400);

  const onDistanceThresholdChange = (value: number) => {
    debouncedUpdateMetricFilter('distance', value, distanceOperator, setDistanceThreshold, updateUIAndFilter);
  };

  const onElevationThresholdChange = (value: number) => {
    debouncedUpdateMetricFilter('elevation', value, elevationOperator, setElevationThreshold, updateUIAndFilter);
  };

  const onToggleMilestonesMode = (value: true | null) => {
    setViewMilestonesBool(!!value); // set to true if true, set to false if null;

    if (value) {
      const filteredData = applyMilestoneFilters(notionData, unitOfDistance);
      setDisplayData(filteredData);
    } else {
      const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig({}));
      setDisplayData(filteredData);
    }
  };

  const onMarkerClick = (_event, activities, locationName: string) => {
    setDetailsTitle(`${locationName}`);
    setDetailsTitleClass('text-slate-300 text-lg');
    setActiveTab(SECTIONS.DETAILS_SECTION);
    setDetailsContent(activities);
  };



  if (loading) {
    return (
      <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
        <EmptyHomePage />
      </PrimeReactProvider>
    );
  }

  if (!notionData) {
    return <div>Error fetching Notion data</div>;
  }



  return (
    <AuthProvider>
      <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
        <Toast ref={toast} />
        <div className="w-full h-screen">
          <div className="w-full flex h-16">
            <Navbar />
          </div>
          <div className="flex h-[calc(100vh-4rem)]">
            <div className="md:w-1/4 2xl:w-128 ">
              {/* <a href="https://www.flaticon.com/free-icons/travel" title="travel icons">Travel icons created by Freepik - Flaticon</a> */}

              <div className="">
                <Accordion activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}
                  pt={{
                    accordiontab: {
                      headerAction: {
                        className: 'custom-border-top hover:!border-[#e2e8ff1a] dark:bg-gray-950 dark:hover:bg-gray-950 dark:hover:text-white\/80 dark:focus:shadow-none'
                      },
                      content: {
                        className: 'custom-border-bottom dark:bg-gray-950'
                      }
                    }
                  }}>
                  <AccordionTab header="Filters"
                    pt={{
                      content: {
                        className: `p-0 h-[calc(100vh-11.25rem)] overflow-y-scroll transition-all duration-1000 ${filterInnerShadows}`
                      }
                    }}>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Who Was There?
                      <div ref={filterPanelTopRef}></div>
                    </div>
                    <div className="pb-7">
                      <ImageRadioButtons onChange={onParticipantChange} disabled={viewMilestonesBool} />
                    </div>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Years
                    </div>
                    <div className="flex flex-row pb-7">
                      <div>
                        <MultiSelect
                          value={selectedYears}
                          onChange={(e) => onYearSelectChange(e.value)}
                          options={yearOptions}
                          disabled={viewMilestonesBool}
                          optionLabel="name"
                          display="chip"
                          placeholder="Select Years"
                          className="w-full transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Activity Type
                    </div>
                    <div className="flex flex-row pb-7">
                      <div className="card flex flex-wrap justify-content-center gap-3">
                        <div className="flex align-items-center">
                          <ImageWithCheckBox
                            value={HIKING}
                            onChange={onActivitySelectChange}
                            checked={selectedActivities.includes(HIKING)}
                            disabled={viewMilestonesBool}
                            imgSrc="/walkplain.png"
                            title="Hike"
                            inputId="activity1"
                            size={24}
                            margin={'mx-1'}
                          />
                          <label htmlFor="activity1" className="">Hike</label>
                        </div>
                        <div className="flex align-items-center">
                          <ImageWithCheckBox
                            value={BIKING}
                            onChange={onActivitySelectChange}
                            checked={selectedActivities.includes(BIKING)}
                            disabled={viewMilestonesBool}
                            imgSrc="/bicycleplain.png"
                            title="Bike"
                            inputId="activity2"
                            size={24}
                            margin={'mx-1.5'}
                          />
                          <label htmlFor="activity2" className="">Bike</label>
                        </div>
                        <div className="flex align-items-center">
                          <ImageWithCheckBox
                            value={TRAVEL}
                            onChange={onActivitySelectChange}
                            checked={selectedActivities.includes(TRAVEL)}
                            disabled={viewMilestonesBool}
                            imgSrc="/airplaneplain.png"
                            title="Travel"
                            inputId="activity3"
                            size={22}
                            margin={'mx-2'}
                          />
                          <label htmlFor="activity3" className="">Travel</label>
                        </div>
                      </div>
                    </div>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Distance
                    </div>
                    <div className="flex flex-row pb-7 gap-4">
                      <ThresholdFilter
                        name="Distance"
                        operator={distanceOperator}
                        onOperatorChange={onDistanceOperatorChange}
                        operatorOptions={operatorOptions}
                        disabled={viewMilestonesBool}
                        threshold={distanceThreshold}
                        onThresholdChange={onDistanceThresholdChange}
                        placeholder={unitOfDistance}
                        step={1}
                      />
                    </div>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Elevation Gain
                    </div>
                    <div className="flex flex-row pb-7 gap-4">
                      <ThresholdFilter
                        name="Elevation"
                        operator={elevationOperator}
                        onOperatorChange={onElevationOperatorChange}
                        operatorOptions={operatorOptions}
                        disabled={viewMilestonesBool}
                        threshold={elevationThreshold}
                        onThresholdChange={onElevationThresholdChange}
                        placeholder={`ft`}
                        step={100}
                      />
                    </div>
                    <div className="mt-4">
                      <SelectButton
                        value={viewMilestonesBool}
                        onChange={(e) => onToggleMilestonesMode(e.value)}
                        options={[{ label: '🏆 Milestones', value: true }]}
                        className="transition-all duration-300"
                        pt={{
                          // root: {
                          //   className: 'flex flex-nowrap'
                          // },
                          button: {
                            className: '!py-2 !rounded-md'
                          },
                          label: {
                            className: 'font-normal'
                          }
                        }}
                      />
                    </div>
                    <div ref={filterPanelBottomRef}></div>
                    <div className="h-8"></div>

                  </AccordionTab>
                  <AccordionTab header={detailsTitle}
                    pt={{
                      content: {
                        className: `p-0 h-[calc(100vh-11.25rem)] overflow-y-scroll ${detailsInnerShadows}`
                      },
                      headerTitle: {
                        className: `${detailsTitleClass}`
                      }
                    }}>
                    <DetailsList
                      activities={detailsContent}
                      milestoneMode={viewMilestonesBool}
                      distanceUnit={unitOfDistance}
                      setDetailsInnerShadows={setDetailsInnerShadows}
                    />

                  </AccordionTab>
                </Accordion>
              </div>
            </div>
            <div className="md:w-3/4 2xl:flex-1">
              <APIProvider apiKey={apiKey}>
                <CustomMap displayData={displayData} onMarkerClick={onMarkerClick} />
              </APIProvider>
            </div>
          </div>
        </div>
      </PrimeReactProvider>
    </AuthProvider>
  );
}
