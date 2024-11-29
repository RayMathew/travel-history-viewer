import React, { useState, useEffect } from 'react';

import Image from 'next/image';

import { Button } from 'primereact/button';

import { humanReadableDate, distanceUnit } from '@/lib/maphelper';
import { getThumbnailFromCache, saveThumbnailToCache } from '@/lib/browsercachehelper';

import { BIKING, HIKING, TRAVEL } from '@/lib/constants';

export default function DetailsList({ activities, milestoneMode = false }) {



    // <a href="https://www.flaticon.com/free-icons/instagram-logo" title="instagram logo icons">Instagram logo icons created by Freepik - Flaticon</a>

    if (!activities) return null;

    activities = activities.sort((a, b) => {

        if (new Date(a.startDate || a.date) < new Date(b.startDate || b.date)) return 1;
        else if (new Date(a.startDate || a.date) > new Date(b.startDate || b.date)) return - 1;
        else return 0;
    });

    const [thumbnails, setThumbnails] = useState({});

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
    }, [activities]);

    const getActivityThumbnail = async (googlePhotosLink, activity) => {
        // console.log('what', activity, googlePhotosLink)
        // if (!googlePhotosLink) return getDefaultThumbnail(activity);
        // console.log('did it come here')

        // if (googlePhotosLink) {
        try {
            const response = await fetch(`/api/thumbnail?glink=${googlePhotosLink}`);
            const data = await response.json();
            // console.log('final link', data.thumbnailLink)
            return data.thumbnailLink;
        } catch (err) {
            console.error('Error fetching thumbnail:', err);
            return getDefaultThumbnail(activity);
        }
    };

    const getDefaultThumbnail = (activity) => {
        switch (activity.type) {
            case HIKING:
                return '/malewalk.png';
            case BIKING:
                return '/femalebicyclesquare.png';
            case TRAVEL:
                return '/airplane.png';
            default:
                return '/malewalk.png';
        }
    };




    return (
        <div>
            {activities.map((activity) => {
                const { googlePhotosLink } = activity;
                const thumbnailSrc = thumbnails[googlePhotosLink] || getDefaultThumbnail(activity);
                return (

                // <div key={index} className="flex bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                    <div key={`${thumbnailSrc}-${activity.date}`}>
                    <div className='bg-white text-gray-700 shadow-md rounded-md dark:bg-gray-900 dark:text-white'>

                            <div className='flex p-5 gap-4'>
                                <div className='w-1/3  aspect-square relative h-full'>
                                    <Image
                                        className='object-cover object-center rounded-lg'
                                        alt="Activity Image"
                                        fill={true}
                                        src={thumbnailSrc}
                                        onLoadingComplete={(e) => {
                                            e.target.style.opacity = 1; // Avoid flickering
                                        }}
                                        style={{ opacity: thumbnails[googlePhotosLink] ? 1 : 0 }}
                                    />
                                </div>
                                {/* <img className='w-1/3 object-cover object-center aspect-square rounded-lg h-full' alt="Card" src={thumbnails[activity.googlePhotosLink] || getDefaultThumbnail(activity)} /> */}
                                <div className='w-2/3 grid content-center'>
                                    <div className='text-lg font-bold mb-2 self-center'>
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
                        </>

                        <div className="">
                            {activity.type === TRAVEL && (
                                <>
                                    <div>{humanReadableDate(activity.startDate)}</div>
                                    <div>{`People: ${activity.people}`}</div>

                                </>
                            )}
                                {(activity.type === HIKING) && (
                                    <>
                                        <div>{humanReadableDate(activity.date)}</div>
                                        <div className=''>
                                            <div>Hiked <strong>{`${activity.distance}`}</strong> {`${distanceUnit}`}</div>
                                            <div>{`Elevation: ${activity.elevation} ft`}</div>
                                        </div>

                                    </>
                                )}
                                {(activity.type === BIKING) && (
                                <>
                                    <div>{humanReadableDate(activity.date)}</div>
                                    <div className=''>
                                        <div>{`Distance: ${activity.distance} ${distanceUnit}`}</div>
                                        <div>{`Elevation: ${activity.elevation} ft`}</div>
                                    </div>

                                </>
                            )}
                        </div>


                        <div className='flex'>
                            <Button
rounded
text
raised
aria-label='Google Photos'
onClick={e => {
                                window.open(activity.googlePhotosLink, "_blank")
                            }}
                                    disabled={!activity.googlePhotosLink}
                                    tooltip="No album available"
                                    tooltipOptions={{ showOnDisabled: true, showDelay: 400 }}
className='aspect-square'
>
                                <img className='w-6' src="/photoalbum.png" />
                            </Button>
                            <Button
rounded
text
raised
aria-label='Instagram'
onClick={e => {
                                window.open(activity.instagramLink, "_blank")
                            }}
className='aspect-square'
                                    tooltip="No post available"
                                    tooltipOptions={{ showOnDisabled: true, position: 'top', showDelay: 400 }}
                                    disabled={!activity.instagramLink}
                                >
                                <img className='w-6' src="/instagram.png" />
                            </Button>
                            {activity.type === TRAVEL && (
                                <Button
rounded
text
raised
aria-label='Journal'
                                        onClick={e => {
                                            window.open(activity.journalLink, "_blank")
                                        }}
className='aspect-square'
                                        tooltip="No journal entry available"
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
className='aspect-square'
                                        tooltip="No AllTrails link available"
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
        </div>
    );

}

