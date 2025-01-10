import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Skeleton } from 'primereact/skeleton';
import { NAMRATA, RAY } from "@/lib/constants";
import { ImageWithRadioButtonsProps } from "@/lib/types/frontend";

const ImageRadioButtons = React.memo(({ onChange, disabled }: ImageWithRadioButtonsProps) => {
    const [selected, setSelected] = useState('both');
    const [loaded, setLoaded] = useState(false);
    const [visibilityClass, setVisibilityClass] = useState('h-0 invisible');

    const handleSelectionChange = useCallback(
        (value: string) => {
            setSelected(value);
            onChange(value);
        },
        [onChange]
    );

    const handleImageLoad = useCallback(() => {
        setLoaded(true);
        setVisibilityClass('');
    }, []);

    const renderRadioButton = (value: string, src: string, alt: string) => (
        <label
            style={{
                display: 'inline-block',
                borderRadius: '50%',
                border: selected === value ? '4px solid #5FA5F9' : '4px solid transparent',
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
                disabled={disabled}
                onChange={() => handleSelectionChange(value)}
            />
            <Image
                src={src}
                alt={alt}
                width={72}
                height={72}
                onLoad={handleImageLoad}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
                className={`${disabled ? 'blur-sm brightness-75' : ''} transition-all duration-300`}
                unoptimized
            />
        </label>
    );


    return (
        <>
            {!loaded && (
                <div className="flex flex-row justify-center gap-6.5">
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} shape="circle" size="5rem" className="" ></Skeleton>
                    ))}
                </div>
            )}
            <div className={`flex flex-row justify-center gap-6.5 ${visibilityClass}`}>
                {renderRadioButton(RAY, "/api/image/ray", "Me")}
                {renderRadioButton(NAMRATA, "/api/image/namrata", "Wife")}
                {renderRadioButton("both", "/api/image/raynam", "Both")}
            </div>
        </>
    );
});

ImageRadioButtons.displayName = "ImageRadioButtons";

export default ImageRadioButtons;

