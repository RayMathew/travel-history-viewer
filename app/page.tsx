"use client";

import React, { useEffect, useState, useRef, useCallback, Profiler } from "react";
import {
  APIProvider,
  // useMap,
  // InfoWindow,
  // useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import debounce from 'lodash.debounce';
import AuthProvider from "./components/AuthProvider/authprovider";
import CustomMap from "./components/CustomMap/custommap";
import Image from "next/image";
import Navbar from "./components/Navbar/navbar";
import ImageWithCheckBox from "./components/ImageWithCheckBox/imagewithcheckbox";
import ThresholdFilter from "./components/ThresholdFilter/thresholdfilter";
const DetailsList = React.lazy(() => import("./components/DetailsList/detailslist"));
import { PrimeReactProvider } from "primereact/api";
import EmptyHomePage from "./components/PlaceHolderScreens/emptyhomepage";
import 'primeicons/primeicons.css';
import Tailwind from 'primereact/passthrough/tailwind';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Sidebar } from 'primereact/sidebar';
import { MultiSelect } from 'primereact/multiselect';
import { SelectButton } from 'primereact/selectbutton';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useIntersectionObserver } from 'primereact/hooks';
import useIsMobile from "@/hooks/useIsMobile";

import { countActivities, applyFiltersToMap, applyMilestoneFilters } from "@/lib/maphelper";
import { BIKING, HIKING, TRAVEL, SECTIONS, RAY, NAMRATA } from "@/lib/constants";
import { FilterOptions, Operator, YearOption } from "@/lib/types/frontend";
import { FilteredNotionData, NotionData } from "@/lib/types/shared";

export default function Home() {
  const [notionData, setNotionData] = useState<NotionData | null>(null);
  const [displayData, setDisplayData] = useState<FilteredNotionData | null>(null);
  const [unitOfDistance, setUnitOfDistance] = useState<string>('km');
  const [loading, setLoading] = useState(true);

  const [sidebarVisible, setSidebarVisible] = useState(false);

  const [selectedParticipant, setSelectedParticipant] = useState<string>('both');

  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [yearOptions, setYearOptions] = useState<YearOption[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([BIKING, HIKING, TRAVEL]);
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
  const [loaded, setLoaded] = useState(false);
  const [profileVisibilityClass, setProfileVisibilityClass] = useState('h-0 invisible');
  const isMobile = useIsMobile();



  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  const onMenuClick = () => setSidebarVisible(true);

  const displayInfo = useCallback((info: number) => {
    toast.current?.show({ severity: 'info', summary: 'Info', detail: `Found ${info} activities` });
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/notion");
        const data: NotionData = await response.json();
        if (!data) throw Error('Notion data not available');
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

    const setupData = (initialData: NotionData) => {
      const { outdoorsData, travelData, distanceUnit } = initialData;

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
      setUnitOfDistance(distanceUnit);
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

  const updateFilterConfig = useCallback((filter: FilterOptions): FilterOptions => {
    return {
      participant: filter.participant || selectedParticipant!,
      years: filter.years || selectedYears,
      activityTypes: filter.activityTypes || selectedActivities,
      distance: filter.distance || { operator: distanceOperator.trim(), value: distanceThreshold },
      elevation: filter.elevation || { operator: elevationOperator.trim(), value: elevationThreshold }
    };
  }, [
    distanceOperator,
    distanceThreshold,
    elevationOperator,
    elevationThreshold,
    selectedActivities,
    selectedParticipant,
    selectedYears
  ]);

  const updateUIAndFilter = useCallback((filterUpdates: FilterOptions) => {
    const filteredData = applyFiltersToMap(false, notionData, updateFilterConfig(filterUpdates));
    const count = countActivities(filteredData);
    displayInfo(count);
    setDisplayData(filteredData);
  }, [displayInfo, notionData, updateFilterConfig]);




  const onParticipantChange = useCallback((value: string) => {
    setSelectedParticipant(value);

    updateUIAndFilter({ participant: value })
  }, [updateUIAndFilter]);

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

    updateUIAndFilter({ distance: { operator: operator.trim(), value: distanceThreshold } });
  };

  const onElevationOperatorChange = (operator: Operator) => {
    setElevationOperator(operator);

    updateUIAndFilter({ elevation: { operator: operator.trim(), value: elevationThreshold } });
  };

  const debouncedUpdateMetricFilter = useRef(
    debounce((key: string, value: number, operator: Operator, updateState, updateFn) => {
      updateState(value);
      updateFn({ [key]: { operator: operator.trim(), value } });
    }, 400)
  ).current;

  const onDistanceThresholdChange = (value: number) => {
    if (value === 0) return;
    debouncedUpdateMetricFilter('distance', value, distanceOperator, setDistanceThreshold, updateUIAndFilter);
  };

  const onElevationThresholdChange = (value: number) => {
    if (value === 0) return;
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

  const map = useRef(new Map()).current;



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



  function onRender(id, phase, actualDuration, baseDuration, startTime, commitTime) {
    // Aggregate or log render timings...

    if (map.get(id)) {
      map.set(id, (map.get(id) + 1));
    } else {
      map.set(id, 1);
    }

    console.table([id, phase, actualDuration, baseDuration, startTime, commitTime]);
    console.log(map.entries());
  }

  const onLoadProfilePic = () => {
    setLoaded(true);
    setProfileVisibilityClass('');
  };


  const renderPicRadio = (value: string, src: string, alt: string) => (
    <label
      style={{
        display: 'inline-block',
        borderRadius: '50%',
        border: selectedParticipant === value ? '4px solid #5FA5F9' : '4px solid transparent',
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: '0.5rem'
      }}
    >
      <input
        type="radio"
        name="profile"
        value={value}
        style={{ display: 'none' }}
        disabled={viewMilestonesBool}
        onChange={(e) => onParticipantChange(e.target.value)}
      />
      <Image
        src={src}
        alt={alt}
        width={72}
        height={72}
        onLoad={onLoadProfilePic}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
        className={`${viewMilestonesBool ? 'blur-sm brightness-75' : ''} transition-all duration-300`}
        unoptimized
      />
    </label>
  );

  const FilterSection = () => (
    <div className="w-full">
      <div className="text-md text-[#e2e8ffbf] pb-2">
        Who Was There?
        <div ref={filterPanelTopRef}></div>
      </div>
      <div className="pb-5">
        <Profiler id="ImageradioButtons" onRender={onRender}>
          {/* <ImageRadioButtons onChange={onParticipantChange} disabled={viewMilestonesBool} /> */}
          <>
            {!loaded && (
              <div className="flex flex-row justify-center gap-6.5">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} shape="circle" size="5rem" className="" ></Skeleton>
                ))}
              </div>
            )}
            <div className={`flex flex-row justify-center gap-6.5 ${profileVisibilityClass}`}>
              {renderPicRadio(RAY, "/api/image/ray", "Me")}
              {renderPicRadio(NAMRATA, "/api/image/namrata", "Wife")}
              {renderPicRadio("both", "/api/image/raynam", "Both")}
            </div>
          </>
        </Profiler>
      </div>
      <div className="text-md text-[#e2e8ffbf] pb-2">
        Years
      </div>
      <div className="flex flex-row pb-7">
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
      <div className="text-md text-[#e2e8ffbf] pb-2">
        Activity Type
      </div>
      <div className="flex flex-row pb-7">
        <div className="card flex flex-wrap justify-content-center gap-5">
          <div className="flex align-items-center">
            <Profiler id="ImageWithCheckBox1" onRender={onRender}>
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
            </Profiler>
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
      <div className="flex flex-row pb-7">
        <Profiler id="ThresholdFilter1" onRender={onRender}>
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
        </Profiler>
      </div>
      <div className="text-md text-[#e2e8ffbf] pb-2">
        Elevation Gain
      </div>
      <div className="flex flex-row pb-7">
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
    </div>
  );



  return (
    <Profiler id="MainProfile" onRender={onRender}>
      <AuthProvider>
        <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
          <Toast ref={toast} />
          <div className="w-full h-screen relative md:static">
            <Profiler id="NavBar" onRender={onRender}>
              <nav className="w-full flex h-16 absolute md:static">
                <Navbar onMenuClick={onMenuClick} />
              </nav>
            </Profiler>
            <div className="flex w-full h-full md:h-[calc(100vh-4rem)] absolute top-0 md:static">
              {isMobile && (
                <Sidebar
                  visible={sidebarVisible}
                  onHide={() => setSidebarVisible(false)}
                  blockScroll
                  header={(
                    <div className="w-full">
                      <span className="text-lg">Filters</span>
                    </div>
                  )}
                  className="w-5/6 md:hidden"
                >
                  <FilterSection />
                </Sidebar>
              )}
              <div className="hidden md:block md:w-1/4 2xl:w-128">
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

                      {!isMobile && <FilterSection />}
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
                      <Profiler id="DetailsList" onRender={onRender}>
                        <DetailsList
                          activities={detailsContent}
                          milestoneMode={viewMilestonesBool}
                          distanceUnit={unitOfDistance}
                          setDetailsInnerShadows={setDetailsInnerShadows}
                        />
                      </Profiler>
                    </AccordionTab>
                  </Accordion>
                </div>
              </div>
              <div className="w-full md:w-3/4 2xl:flex-1">
                <APIProvider apiKey={apiKey}>
                  <CustomMap displayData={displayData} onMarkerClick={onMarkerClick} />
                </APIProvider>
              </div>
            </div>
          </div>
        </PrimeReactProvider>
      </AuthProvider>
    </Profiler>
  );
}
