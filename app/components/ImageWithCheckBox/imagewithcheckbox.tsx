import React from "react";
import Image from "next/image";
import { Checkbox } from "primereact/checkbox";
import { ImageWithCheckBoxProps } from "@/lib/types/frontend";

export default function ImageWithCheckBox(
    {
        value,
        onChange,
        checked,
        disabled,
        imgSrc,
        title,
        inputId,
        size,
        margin
    }: ImageWithCheckBoxProps) {
    return (
        <>
            <Checkbox
                inputId={inputId}
                value={value}
                onChange={onChange}
                checked={checked}
                disabled={disabled}
                className="transition-all duration-300"
            />
            <Image
                src={imgSrc}
                width={size}
                height={size}
                alt={title}
                title={title}
                style={{ height: size }}
                className={`${margin} brightness-50`}
            />
        </>
    );
}