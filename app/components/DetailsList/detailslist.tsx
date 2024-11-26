import React from 'react';

import { Button } from 'primereact/button';

import { humanReadableDate, distanceUnit } from '@/lib/maphelper';

import { BIKING, HIKING, TRAVEL } from '@/lib/constants';

export default function DetailsList({ activities }) {

    const header = (activity) => (
        <>
            <div className='flex p-5 gap-4'>
                <img className='w-1/3 aspect-square rounded-lg' alt="Card" src="/image.png" />
                <div className='w-2/3 grid content-center'>
                    <div className='text-2xl font-bold mb-2 self-center'>{activity.activityName}</div>
                </div>
            </div>
        </>
    );

    // <a href="https://www.flaticon.com/free-icons/instagram-logo" title="instagram logo icons">Instagram logo icons created by Freepik - Flaticon</a>
    const footer = (activity) => (
        <div className='flex'>
            <Button rounded text raised aria-label='Google Photos' onClick={e => {
                window.open(activity.googlePhotosLink, "_blank")
            }} className='aspect-square'>
                <img className='w-6' src="/photoalbum.png" />
            </Button>
            <Button rounded text raised aria-label='Instagram' onClick={e => {
                window.open(activity.instagramLink, "_blank")
            }} className='aspect-square'>
                <img className='w-6' src="/instagram.png" />
            </Button>
            <Button rounded text raised aria-label='Journal' className='aspect-square'>
                <img className='w-6' src="/journal.png" />
            </Button>
        </div>
    );



    if (!activities) return null;
    {/* <div
                        className="w-1/3 bg-cover"
                        style={{
                            backgroundImage: `url(${imageUrl})`,
                        }}
                    ></div> */}
    return (
        <>
            {activities.map((activity, index) => (

                // <div key={index} className="flex bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                <div key={index} className=''>
                    <div className='bg-white text-gray-700 shadow-md rounded-md dark:bg-gray-900 dark:text-white'>
                        <>
                            <div className='flex p-5 gap-4'>
                                <img className='w-1/3 aspect-square rounded-lg' alt="Card" src="/image.png" />
                                <div className='w-2/3 grid content-center'>
                                    <div className='text-2xl font-bold mb-2 self-center'>
                                        {activity.type === TRAVEL && (
                                            activity.activityName
                                        )}
                                        {(activity.type === BIKING || activity.type === HIKING) && (
                                            activity.type
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
                            {(activity.type === HIKING || activity.type === BIKING) && (
                                <>
                                    <div>{humanReadableDate(activity.date)}</div>
                                    <div className='flex gap-3'>
                                        <div>{`Distance: ${activity.distance} ${distanceUnit}`}</div>
                                        <div>{`Elevation: ${activity.elevation} ft`}</div>
                                    </div>

                                </>
                            )}
                        </div>


                        <div className='flex'>
                            <Button rounded text raised aria-label='Google Photos' onClick={e => {
                                window.open(activity.googlePhotosLink, "_blank")
                            }} className='aspect-square'>
                                <img className='w-6' src="/photoalbum.png" />
                            </Button>
                            <Button rounded text raised aria-label='Instagram' onClick={e => {
                                window.open(activity.instagramLink, "_blank")
                            }} className='aspect-square'>
                                <img className='w-6' src="/instagram.png" />
                            </Button>
                            {activity.type === TRAVEL && (
                                <Button rounded text raised aria-label='Journal' className='aspect-square'>
                                    <img className='w-6' src="/journal.png" />
                                </Button>
                            )}
                            {(activity.type === HIKING || activity.type === BIKING) && (
                                <Button rounded text raised aria-label='AllTrails' className='aspect-square'>
                                    <img className='w-6' src="/alltrails.png" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );

}

