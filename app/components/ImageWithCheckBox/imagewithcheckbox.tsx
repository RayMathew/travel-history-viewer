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
        label,
        inputId,
        size,
        margin
    }: ImageWithCheckBoxProps) {
    return (
        <div className="flex align-items-center">
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
                alt=""
                style={{ height: size }}
                className={`${margin} brightness-50`}
            />
            <label className="text-sm leading-6" htmlFor={inputId}>{label}</label>
        </div>
    );
}