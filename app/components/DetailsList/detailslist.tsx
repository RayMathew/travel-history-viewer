import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';

import Image from 'next/image';

import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { useIntersectionObserver } from 'primereact/hooks';

// import { humanReadableDate } from '@/lib/maphelper';
import { getThumbnailFromCache, saveThumbnailToCache } from '@/lib/browsercachehelper';

import { BIKING, HIKING, TRAVEL } from '@/lib/constants';
import EmptyDetailsPanel from '../PlaceHolderScreens/emptydetailspanel';
import { DetailslistProps } from '@/lib/types/frontend';
import { OutdoorActivity, TravelActivity } from '@/lib/types/shared';
import { UserContext } from "@/app/providers/UserProvider/userprovider";
import useIsMobile from '@/hooks/useIsMobile';
import { getGrade } from '@/lib/maphelper';



export default function DetailsList({ activities, milestoneMode = false }: DetailslistProps) {
    const [detailsInnerShadows, setDetailsInnerShadows] = useState('custom-bottom-inner-shadow');
    const [panelHtClsMobile, setPanelHtClsMobile] = useState('');
    const { unitOfDistance, userName } = useContext(UserContext);

    const isAdmin: boolean = userName !== 'Guest';

    const isMobile = useIsMobile();

    const detailsPanelTopRef = useRef(null);
    const detailsPanelTopVisible = useIntersectionObserver(detailsPanelTopRef);
    const detailsPanelBottomRef = useRef(null);
    const detailsPanelBottomVisible = useIntersectionObserver(detailsPanelBottomRef);

    // <a href="https://www.flaticon.com/free-icons/instagram-logo" title="instagram logo icons">Instagram logo icons created by Freepik - Flaticon</a>

    const sortedActivities = useMemo(() => {
        return activities?.sort((a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date)) || [];
    }, [activities]);

    const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

    const getDefaultThumbnail = (activity: OutdoorActivity | TravelActivity) => {
        switch (activity.type) {
            case HIKING:
                return '/malewalksquare.png';
            case BIKING:
                return '/femalebicyclesquare.png';
            case TRAVEL:
                return '/airplanesquare.png';
            default:
                return '/malewalksquare.png';
        }
    };

    const getActivityThumbnail = useCallback(async (googlePhotosLink: string, activity: OutdoorActivity | TravelActivity) => {
        try {
            const response = await fetch(`/api/thumbnail?glink=${googlePhotosLink}`);
            const data = await response.json();
            return data.thumbnailLink;
        } catch (err) {
            console.error('Error fetching thumbnail:', err);
            return getDefaultThumbnail(activity);
        }
    }, []);

    useEffect(() => {
        const fetchThumbnails = async () => {
            const newThumbnails: Record<string, string> = {};

            await Promise.all(
                sortedActivities.map(async (activity) => {
                    const { googlePhotosLink } = activity;

                    if (googlePhotosLink == undefined) {
                        newThumbnails['default'] = getDefaultThumbnail(activity);
                        return;
                    } else {
                        const cachedThumbnail = getThumbnailFromCache(googlePhotosLink);

                        if (cachedThumbnail) {
                            // Use cached thumbnail
                            newThumbnails[googlePhotosLink] = cachedThumbnail;
                        } else {
                            const thumbnailUrl = await getActivityThumbnail(googlePhotosLink, activity);
                            newThumbnails[googlePhotosLink] = thumbnailUrl;
                            saveThumbnailToCache(googlePhotosLink, thumbnailUrl);
                        }
                    }

                })
            );

            setThumbnails((prev) => ({ ...prev, ...newThumbnails }));
        };

        fetchThumbnails();
    }, [sortedActivities, getActivityThumbnail]);

    // adjust height of details list panel for mobile mode
    useEffect(() => {
        if (isMobile) {
            if (sortedActivities.length === 1) {
                setPanelHtClsMobile('!max-h-106 !h-[calc(61vh)]');
            } else {
                setPanelHtClsMobile('!h-[calc(61vh)]');
            }
        }
    }, [isMobile, sortedActivities]);

    // handle shadow based on scroll position
    useEffect(() => {
        if (isMobile && sortedActivities.length === 1) {
            setDetailsInnerShadows('');
        }
        else if (detailsPanelTopVisible) {
            setDetailsInnerShadows('custom-bottom-inner-shadow');
        } else if (detailsPanelBottomVisible) {
            setDetailsInnerShadows('custom-top-inner-shadow');
        }
        else if (!detailsPanelTopVisible && !detailsPanelBottomVisible) {
            setDetailsInnerShadows('custom-top-bottom-inner-shadow');
        }
    }, [detailsPanelTopVisible, detailsPanelBottomVisible, setDetailsInnerShadows]);


    const getDoneBy = (doneByArray: string[]): string => {
        const firstNames = doneByArray.map(fullName => fullName.split(" ")[0]);
        return firstNames.join(", ");
    };
    const getPlaces = (places: string[]): string => {
        return places.join(", ")
    };
    const getDuration = (startDateString: string, endDateString: string): string => {
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);
        const differenceInTime = endDate.getTime() - startDate.getTime();

        return `${differenceInTime / (1000 * 3600 * 24)} days`;
    };

    const getHighlightColor = (is_A_Miletone: boolean | undefined) => {
        if (milestoneMode && is_A_Miletone) return 'dark:bg-emerald-900';
        return 'dark:bg-zinc-800/50';

    };

    if (!sortedActivities.length) return (<EmptyDetailsPanel />);


    return (
        <div className={`${detailsInnerShadows} ${panelHtClsMobile} md:!h-full overflow-x-hidden`}>
            <div ref={detailsPanelTopRef}></div>
            {sortedActivities.map((activity) => {
                const { googlePhotosLink } = activity;
                const thumbnailSrc = thumbnails[googlePhotosLink] || getDefaultThumbnail(activity);
                return (

                    // <div key={index} className="flex bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                    <div key={`${thumbnailSrc}-${activity.date || activity.startDate}`}>
                        <div className='p-5 mb-5 w-[calc(85vw)] m-auto md:w-full bg-white text-gray-700 shadow-md rounded-md dark:bg-zinc-900 border dark:border-zinc-800 dark:text-white'>

                            <div className='flex gap-4'>
                                <div className='w-1/3 drop-shadow-xl aspect-square relative h-full'>
                                    <Image
                                        className='object-cover object-center rounded-lg transition-opacity duration-700'
                                        alt="Activity image thumbnail"
                                        fill={true}
                                        src={thumbnailSrc}
                                        onLoadingComplete={(e) => {
                                            e.style.opacity = 1;
                                        }}
                                        style={{ opacity: thumbnailSrc ? 1 : 0 }}
                                    />
                                </div>
                                {/* <img className='w-1/3 object-cover object-center aspect-square rounded-lg h-full' alt="Card" src={thumbnails[activity.googlePhotosLink] || getDefaultThumbnail(activity)} /> */}
                                <div className='w-2/3 grid content-center'>
                                    <div className='text-md font-medium mb-2 self-center text-slate-300'>
                                        {/* {activity.type === TRAVEL && (
                                            activity.activityName
                                        )} */}
                                        {!milestoneMode && (
                                            activity.activityName
                                        )}
                                        {milestoneMode && (
                                            activity.locationName
                                        )}
                                    </div>
                                </div>
                            </div>


                            <div className="mt-4">
                                {activity.type === TRAVEL && (
                                    <>
                                        <div className='flex gap-4'>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-zinc-800/50 dark:text-white'>
                                                <div className='text-sm font-extralight'>Places</div>
                                                <div className='font-medium'>{getPlaces(activity.places)}</div>
                                            </div>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-zinc-800/50 dark:text-white flex flex-col'>
                                                <div className='text-sm font-extralight'>People</div>
                                                <div className='font-medium'>{activity.people}</div>
                                            </div>
                                        </div>
                                        <div className='flex gap-4 mt-4'>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-zinc-800/50 dark:text-white'>
                                                <div className='text-sm font-extralight'>Duration</div>
                                                <div className='font-medium'>{getDuration(activity.startDate, activity.endDate)}</div>
                                            </div>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 rounded-md dark:bg-zinc-900 dark:text-white'>

                                            </div>
                                        </div>
                                    </>
                                )}
                                {(activity.type === HIKING || activity.type === BIKING) && (
                                    <>
                                        <div className='flex gap-4'>
                                            <div className={`w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:text-white ${getHighlightColor(activity.milestones?.elevation)}`}>
                                                <div className='text-sm font-extralight'>Elevation Gain</div>
                                                <div className='font-medium'>{`${activity.elevation} ft`}</div>
                                            </div>
                                            <div className={`w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:text-white flex flex-col ${getHighlightColor(activity.milestones?.distance)}`}>
                                                <div className='text-sm font-extralight'>Distance</div>
                                                <div className='font-medium'>{`${activity.distance}`} {`${unitOfDistance}`}</div>
                                            </div>
                                        </div>
                                        <div className='flex gap-4 mt-4'>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:text-white dark:bg-zinc-800/50'>
                                                <div className='text-sm font-extralight'>Done By</div>
                                                <div className='font-medium'>{getDoneBy(activity.doneBy)}</div>
                                            </div>
                                            <div className={`w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:text-white ${getHighlightColor(activity.milestones?.grade)}`}>
                                                <div className='flex flex-row justify-between'>
                                                    <div className='text-sm font-extralight'>Grade</div>
                                                    <i className="hiking-grade-tooltip pi pi-question-circle text-slate-300 !leading-5 !text-xs !font-thin"
                                                    ></i>
                                                    <Tooltip target=".hiking-grade-tooltip" className='w-96'>
                                                        <Image
                                                            alt="Explanation of grade as an equation"
                                                            width={374}
                                                            height={63.9}
                                                            src="/grade.png"
                                                        />
                                                        E.g., a 10% grade means there is a 10-meter elevation gain for every 100 meters traveled horizontally.
                                                    </Tooltip>
                                                </div>
                                                <div className='font-medium'>{getGrade(activity.elevation, activity.distance, unitOfDistance)}%</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className='flex mt-4 gap-2'>
                                {isAdmin && (
                                    <Button
                                        rounded
                                        text
                                        raised
                                        aria-label='Google Photos'
                                        onClick={e => {
                                            window.open(activity.googlePhotosLink, "_blank")
                                        }}
                                        disabled={!activity.googlePhotosLink}
                                        tooltip={activity.googlePhotosLink ? '' : "No album available"}
                                        tooltipOptions={{ showOnDisabled: true, showDelay: 400 }}
                                        className='aspect-square drop-shadow-2xl'
                                    >
                                        <img className='w-6' src="/photoalbum.png" />
                                    </Button>
                                )}
                                <Button
                                    rounded
                                    text
                                    raised
                                    aria-label='Instagram'
                                    onClick={e => {
                                        window.open(activity.instagramLink, "_blank")
                                    }}
                                    className='aspect-square drop-shadow-2xl'
                                    tooltip={activity.instagramLink ? '' : "No post available"}
                                    tooltipOptions={{ showOnDisabled: true, position: 'top', showDelay: 400 }}
                                    disabled={!activity.instagramLink}
                                >
                                    <img className='w-6' src="/instagram.png" />
                                </Button>
                                {isAdmin && activity.type === TRAVEL && (
                                    <Button
                                        rounded
                                        text
                                        raised
                                        aria-label='Journal'
                                        onClick={e => {
                                            window.open(activity.journalLink, "_blank")
                                        }}
                                        className='aspect-square drop-shadow-2xl'
                                        tooltip={activity.journalLink ? '' : "No journal entry available"}
                                        tooltipOptions={{ showOnDisabled: true, position: 'top', showDelay: 400 }}
                                        disabled={!activity.journalLink}
                                    >
                                        <img className='w-6' src="/journal.png" />
                                    </Button>
                                )}
                                {(activity.type === HIKING || activity.type === BIKING) && (
                                    <Button
                                        rounded
                                        text
                                        raised
                                        aria-label='AllTrails'
                                        onClick={e => {
                                            window.open(activity.allTrailsLink, "_blank")
                                        }}
                                        className='aspect-square dark:from-zinc-400 dark:to-zinc-900'
                                        tooltip={activity.allTrailsLink ? '' : "No AllTrails link available"}
                                        tooltipOptions={{ showOnDisabled: true, position: 'top', showDelay: 400 }}
                                        disabled={!activity.allTrailsLink}
                                    >
                                        <img className='w-6' src="/alltrails.png" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
            <div ref={detailsPanelBottomRef}></div>
        </div>
    );

}

