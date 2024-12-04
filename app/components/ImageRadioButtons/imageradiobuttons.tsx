import React, { useState } from "react";
import Image from "next/image";
import { NAMRATA, RAY } from "@/lib/constants";

export default function ImageRadioButtons({ onChange, disabled }) {
    const [selected, setSelected] = useState('both');

    const selectRadioOption = (value) => {
        setSelected(value);
        onChange(value);
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <label
                style={{
                    display: 'inline-block',
                    borderRadius: '50%',
                    border: selected === RAY ? '4px solid #5FA5F9' : '4px solid transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                <input
                    type="radio"
                    name="profile"
                    value={RAY}
                    style={{ display: 'none' }}
                    disabled={disabled}
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
                    border: selected === NAMRATA ? '4px solid #5FA5F9' : '4px solid transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                <input
                    type="radio"
                    name="profile"
                    value={NAMRATA}
                    style={{ display: 'none' }}
                    disabled={disabled}
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
                    border: selected === 'both' ? '4px solid #5FA5F9' : '4px solid transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                <input
                    type="radio"
                    name="profile"
                    value="both"
                    style={{ display: 'none' }}
                    disabled={disabled}
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