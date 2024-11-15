import React, { useEffect, useState } from "react";
import Image from "next/image";
import { NAMRATA, RAY } from "@/lib/constants";

export default function ImageRadioButtons({ onChange }) {
    const [selected, setSelected] = useState('both');

    const selectRadioOption = (value) => {
        // console.log(value)
        setSelected(value);
        onChange(value);
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            {/* Radio button 1: Your image */}
            <label
                style={{
                    display: 'inline-block',
                    borderRadius: '50%',
                    border: selected === RAY ? '4px solid blue' : '4px solid transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                <input
                    type="radio"
                    name="profile"
                    value={RAY}
                    style={{ display: 'none' }}
                    onChange={(e) => selectRadioOption(e.target.value)}
                />
                <Image
                    src="/api/image/ray"
                    alt="Me"
                    width={72}
                    height={72}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
            </label>
            <label
                style={{
                    display: 'inline-block',
                    borderRadius: '50%',
                    border: selected === NAMRATA ? '4px solid blue' : '4px solid transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                <input
                    type="radio"
                    name="profile"
                    value={NAMRATA}
                    style={{ display: 'none' }}
                    onChange={(e) => selectRadioOption(e.target.value)}
                />
                <Image
                    src="/api/image/nam"
                    alt="Wife"
                    width={72}
                    height={72}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
            </label>
            <label
                style={{
                    display: 'inline-block',
                    borderRadius: '50%',
                    border: selected === 'both' ? '4px solid blue' : '4px solid transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                <input
                    type="radio"
                    name="profile"
                    value="both"
                    style={{ display: 'none' }}
                    onChange={(e) => selectRadioOption(e.target.value)}
                />
                <Image
                    src="/api/image/raynam"
                    alt="both"
                    width={72}
                    height={72}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
            </label>
        </div>
    );
};