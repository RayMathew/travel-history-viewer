import React, { useState, useEffect, useCallback, useRef } from 'react';

import Image from 'next/image';
import { useSession } from 'next-auth/react';

import { Button } from 'primereact/button';
import { useIntersectionObserver } from 'primereact/hooks';

// import { humanReadableDate } from '@/lib/maphelper';
import { getThumbnailFromCache, saveThumbnailToCache } from '@/lib/browsercachehelper';

import { BIKING, HIKING, TRAVEL } from '@/lib/constants';
import EmptyDetailsPanel from '../PlaceHolderScreens/emptydetailspanel';



export default function DetailsList({ activities, milestoneMode = false, distanceUnit, setDetailsInnerShadows }) {
    const { data } = useSession();
    const isAdmin: boolean = data?.user?.name !== 'Guest';

    const detailsPanelTopRef = useRef(null);
    const detailsPanelTopVisible = useIntersectionObserver(detailsPanelTopRef);
    const detailsPanelBottomRef = useRef(null);
    const detailsPanelBottomVisible = useIntersectionObserver(detailsPanelBottomRef);

    // <a href="https://www.flaticon.com/free-icons/instagram-logo" title="instagram logo icons">Instagram logo icons created by Freepik - Flaticon</a>

    if (activities) {
        activities = activities.sort((a, b) => {

            if (new Date(a.startDate || a.date) < new Date(b.startDate || b.date)) return 1;
            else if (new Date(a.startDate || a.date) > new Date(b.startDate || b.date)) return - 1;
            else return 0;
        });
    }


    const [thumbnails, setThumbnails] = useState({});

    const getActivityThumbnail = useCallback(async (googlePhotosLink, activity) => {

        // if (googlePhotosLink) {
        try {
            const response = await fetch(`/api/thumbnail?glink=${googlePhotosLink}`);
            const data = await response.json();
            return data.thumbnailLink;
        } catch (err) {
            console.error('Error fetching thumbnail:', err);
            return getDefaultThumbnail(activity);
        }
    }, []);;

    useEffect(() => {
        const fetchThumbnails = async () => {
            const newThumbnails = {};

            await Promise.all(
                activities.map(async (activity) => {
                    const { googlePhotosLink } = activity;

                    if (!googlePhotosLink) {
                        newThumbnails[googlePhotosLink] = getDefaultThumbnail(activity);
                        return;
                    }
                    const cachedThumbnail = getThumbnailFromCache(activity.googlePhotosLink);

                    if (cachedThumbnail) {
                        // Use cached thumbnail
                        newThumbnails[activity.googlePhotosLink] = cachedThumbnail;
                    } else {
                        const thumbnailUrl = await getActivityThumbnail(activity.googlePhotosLink, activity);
                        newThumbnails[activity.googlePhotosLink] = thumbnailUrl;
                        saveThumbnailToCache(activity.googlePhotosLink, thumbnailUrl);
                    }
                })
            );

            setThumbnails((prev) => ({ ...prev, ...newThumbnails }));
        };

        // if (activities.length > 0) {
        fetchThumbnails();
        // }
    }, [activities, getActivityThumbnail]);

    useEffect(() => {
        if (detailsPanelTopVisible) {
            setDetailsInnerShadows('custom-bottom-inner-shadow');
        } else if (detailsPanelBottomVisible) {
            setDetailsInnerShadows('custom-top-inner-shadow');
        }
        else if (!detailsPanelTopVisible && !detailsPanelBottomVisible) {
            setDetailsInnerShadows('custom-top-bottom-inner-shadow');
        }
    }, [detailsPanelTopVisible, detailsPanelBottomVisible]);


    const getDefaultThumbnail = (activity) => {
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

    if (!activities) return (<EmptyDetailsPanel />);


    return (
        <div>
            <div ref={detailsPanelTopRef}></div>
            {activities.map((activity) => {
                const { googlePhotosLink } = activity;
                const thumbnailSrc = thumbnails[googlePhotosLink] || getDefaultThumbnail(activity);
                return (

                    // <div key={index} className="flex bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                    <div key={`${thumbnailSrc}-${activity.date}`}>
                        <div className='p-5 mb-5 bg-white text-gray-700 shadow-md rounded-md dark:bg-gray-900 dark:text-white'>

                            <div className='flex gap-4'>
                                <div className='w-1/3 drop-shadow-xl aspect-square relative h-full'>
                                    <Image
                                        className='object-cover object-center rounded-lg transition-opacity duration-700'
                                        alt="Activity Image"
                                        fill={true}
                                        src={thumbnailSrc}
                                        onLoadingComplete={(e) => {
                                            e.style.opacity = 1;
                                        }}
                                        style={{ opacity: thumbnails[googlePhotosLink] ? 1 : 0 }}
                                    />
                                </div>
                                {/* <img className='w-1/3 object-cover object-center aspect-square rounded-lg h-full' alt="Card" src={thumbnails[activity.googlePhotosLink] || getDefaultThumbnail(activity)} /> */}
                                <div className='w-2/3 grid content-center'>
                                    <div className='text-md font-bold mb-2 self-center text-slate-300'>
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
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white'>
                                                <div className='text-sm'>Places</div>
                                                <strong>{getPlaces(activity.places)}</strong>
                                            </div>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white flex flex-col'>
                                                <div className='text-sm'>People</div>
                                                <strong>{activity.people}</strong>
                                            </div>
                                        </div>
                                        <div className='flex gap-4 mt-4'>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white'>
                                                <div className='text-sm'>Duration</div>
                                                <strong>{getDuration(activity.startDate, activity.endDate)}</strong>
                                            </div>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 rounded-md dark:bg-gray-900 dark:text-white'>

                                            </div>
                                        </div>
                                    </>
                                )}
                                {(activity.type === HIKING) && (
                                    <>
                                        <div className='flex gap-4'>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white'>
                                                <div className='text-sm'>Elevation Gain</div>
                                                <strong>{`${activity.elevation} ft`}</strong>
                                            </div>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white flex flex-col'>
                                                <div className='text-sm'>Distance</div>
                                                <strong>{`${activity.distance}`} {`${distanceUnit}`}</strong>
                                            </div>
                                        </div>
                                        <div className='flex gap-4 mt-4'>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white'>
                                                <div className='text-sm'>Done By</div>
                                                <strong>{getDoneBy(activity.doneBy)}</strong>
                                            </div>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 rounded-md dark:bg-gray-900 dark:text-white'>

                                            </div>
                                        </div>
                                    </>
                                )}
                                {(activity.type === BIKING) && (
                                    <>
                                        {/* <div>{humanReadableDate(activity.date)}</div> */}
                                        <div className='flex gap-4'>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white'>
                                                <div className='text-sm'>Elevation Gain</div>
                                                <strong>{`${activity.elevation} ft`}</strong>
                                            </div>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white flex flex-col'>
                                                <div className='text-sm'>Distance</div>
                                                <strong>{`${activity.distance}`} {`${distanceUnit}`}</strong>
                                            </div>
                                        </div>
                                        <div className='flex gap-4 mt-4'>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 drop-shadow-xl rounded-md dark:bg-gray-800 dark:text-white'>
                                                <div className='text-sm'>Done By</div>
                                                <strong>{getDoneBy(activity.doneBy)}</strong>
                                            </div>
                                            <div className='w-1/2 py-4 px-3 text-gray-700 rounded-md dark:bg-gray-900 dark:text-white'>

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
                                        className='aspect-square drop-shadow-2xl'
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

