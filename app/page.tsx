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
import { logout } from "@/lib/actions";
import Image from "next/image";
import CustomMap from "./components/CustomMap/custommap";
import ImageRadioButtons from "./components/ImageRadioButtons/imageradiobuttons";
const DetailsList = React.lazy(() => import("./components/DetailsList/detailslist"));
import { PrimeReactProvider } from "primereact/api";
import 'primeicons/primeicons.css';
import Tailwind from 'primereact/passthrough/tailwind';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';
import { Toast } from 'primereact/toast';

import { countActivities, applyFiltersToMap, applyMilestoneFilters } from "@/lib/maphelper";
import { BIKING, HIKING, TRAVEL, SECTIONS } from "@/lib/constants";

export default function Home() {
  const [notionData, setNotionData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [unitOfDistance, setUnitOfDistance] = useState(null);
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
  const [activeTab, setActiveTab] = useState(SECTIONS.FILTER_SECTION);
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
      const { outdoorsData, travelData, distanceUnit } = initialData;

      setUnitOfDistance(distanceUnit);

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

  const onParticipantChange = (value) => {
    setSelectedParticipant(value);

    updateUIAndFilter({ participant: value })
  };

  const onYearSelectChange = (yearArray) => {
    setSelectedYears(yearArray);

    updateUIAndFilter({ years: yearArray })
  };

  const onActivitySelectChange = (e) => {
    let _selectedActivities = [...selectedActivities];

    if (e.checked)
      _selectedActivities.push(e.value);
    else
      _selectedActivities.splice(_selectedActivities.indexOf(e.value), 1);

    setSelectedActivities(_selectedActivities);

    updateUIAndFilter({ activityTypes: _selectedActivities });
  };

  const onDistanceOperatorChange = (operator) => {
    setDistanceOperator(operator);

    updateUIAndFilter({ distance: { operator: operator.trim(), value: distanceOperator } });
  };

  const onElevationOperatorChange = (operator) => {
    setElevationOperator(operator);

    updateUIAndFilter({ elevation: { operator: operator.trim(), value: elevationOperator } });
  };

  const debouncedUpdateMetricFilter = debounce((key, value, operator, updateState, updateFn) => {
    updateState(value);
    updateFn({ [key]: { operator: operator.trim(), value } });
  }, 400);

  const onDistanceThresholdChange = (value) => {
    debouncedUpdateMetricFilter('distance', value, distanceOperator, setDistanceThreshold, updateUIAndFilter);
  };

  const onElevationThresholdChange = (value) => {
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

  const onMarkerClick = (event, activities, locationName) => {
    setDetailsTitle(`${locationName}`);
    setActiveTab(SECTIONS.DETAILS_SECTION);
    setDetailsContent(activities);
  };



  if (loading) {
    return <div>Loading...</div>;
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
            <div className="flex-1">
              <form
                action={async () => {
                  localStorage.clear();
                  await logout();
                }}
              >
                <button className="group relative w-full flex justify-center py-3 px-4 cursor-pointer text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-200 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-1">
                  {/* <PowerIcon className="w-6" /> */}
                  <div className="hidden md:block">Sign Out</div>
                </button>
              </form>
            </div>
          </div>
          <div className="flex h-[calc(100vh-4rem)]">
            <div className="md:w-1/4 2xl:w-128 ">
              {/* <a href="https://www.flaticon.com/free-icons/travel" title="travel icons">Travel icons created by Freepik - Flaticon</a> */}

              <div className="">
                <Accordion activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}
                  pt={{
                    accordiontab: {
                      headerAction: {
                        className: 'border-0 dark:bg-gray-950 dark:hover:bg-gray-950 dark:hover:text-white\/80 dark:focus:shadow-none'
                      },
                      content: {
                        className: 'border-0 dark:bg-gray-950'
                      }
                    }
                  }}>
                  <AccordionTab header="Filters"
                    pt={{
                      content: {
                        className: 'p-0 h-[calc(100vh-11.25rem)] overflow-y-scroll'
                      }
                    }}>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Who Was There?
                    </div>
                    <div className="pb-4">
                      <ImageRadioButtons onChange={onParticipantChange} disabled={viewMilestonesBool} />
                    </div>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Years:
                    </div>
                    <div className="flex flex-row pb-4">
                      <div>
                        <MultiSelect
                          value={selectedYears}
                          onChange={(e) => onYearSelectChange(e.value)}
                          options={yearOptions}
                          disabled={viewMilestonesBool}
                          optionLabel="name"
                          display="chip"
                          placeholder="Select Years"
                          className="w-full" />
                      </div>
                    </div>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Activity Type:
                    </div>
                    <div className="flex flex-row pb-4">
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
                            src="/walkplain.png"
                            width={24}
                            height={24}
                            alt="Hike"
                            title="Hike"
                            style={{ height: 24 }}
                            className="mx-1"
                          />
                          <label htmlFor="activity1" className="">Hike</label>
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
                            src="/bicycleplain.png"
                            width={24}
                            height={24}
                            alt="Bike"
                            title="Bike"
                            style={{ height: 24 }}
                            className="mx-1.5"
                          />
                          <label htmlFor="activity2" className="">Bike</label>
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
                            src="/airplaneplain.png"
                            width={22}
                            height={22}
                            alt="Travel"
                            title="Travel"
                            style={{ height: 22 }}
                            className="mx-2"
                          />
                          <label htmlFor="activity3" className="">Travel</label>
                        </div>
                      </div>
                    </div>
                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Distance:
                    </div>
                    <div className="flex flex-row pb-4 gap-4">
                      <div>
                        <SelectButton
                          value={distanceOperator}
                          tooltip="Distance less than or greater than"
                          tooltipOptions={{ showDelay: 500, hideDelay: 300 }}
                          onChange={(e) => onDistanceOperatorChange(e.value)}
                          options={operatorOptions}
                          disabled={viewMilestonesBool}
                          pt={{
                            root: {
                              className: 'flex flex-nowrap'
                            },
                            button: {
                              className: '!py-2'
                            }
                          }}
                        />
                      </div>
                      <div>
                        <InputNumber
                          value={distanceThreshold}
                          onValueChange={(e) => onDistanceThresholdChange(e.value)}
                          mode="decimal"
                          min={0}
                          useGrouping={false}
                          maxFractionDigits={1}
                          placeholder={unitOfDistance}
                          suffix={` ${unitOfDistance}`}
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
                                className: '!py-2'
                              },
                            },
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-md text-[#e2e8ffbf] pb-2">
                      Elevation Gain:
                    </div>
                    <div className="flex flex-row pb-4 gap-4 w-full">
                      <div>
                        <SelectButton
                          value={elevationOperator}
                          tooltip="Elevation less than or greater than"
                          tooltipOptions={{ showDelay: 500, hideDelay: 300 }}
                          onChange={(e) => onElevationOperatorChange(e.value)}
                          options={operatorOptions}
                          disabled={viewMilestonesBool}
                          pt={{
                            root: {
                              className: 'flex flex-nowrap'
                            },
                            button: {
                              className: '!py-2'
                            }
                          }}
                        />
                      </div>
                      <div>
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
                          step={100}
                          disabled={viewMilestonesBool}
                          // buttonLayout="vertical"
                          // decrementButtonClassName="p-button-secondary"
                          // incrementButtonClassName="p-button-secondary"
                          // incrementButtonIcon="pi pi-plus"
                          // decrementButtonIcon="pi pi-minus"
                          pt={{
                            input: {
                              root: {
                                className: '!py-2'
                              },
                            },
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <SelectButton
                        value={viewMilestonesBool}
                        onChange={(e) => onToggleMilestonesMode(e.value)}
                        options={[{ label: '🏆 Milestones', value: true }]}
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
                  </AccordionTab>
                  <AccordionTab className="" header={detailsTitle}
                    pt={{
                      content: {
                        className: 'p-0 h-[calc(100vh-11.25rem)] overflow-y-scroll'
                      }
                    }}>
                    <DetailsList activities={detailsContent} milestoneMode={viewMilestonesBool} distanceUnit={unitOfDistance} />

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
