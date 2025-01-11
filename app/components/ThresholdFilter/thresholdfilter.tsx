import React from "react";
import { SelectButton } from "primereact/selectbutton";
import { InputNumber } from "primereact/inputnumber";
import { ThresholdFilterProps } from "@/lib/types/frontend";
import { OperatorSelectButtonPT, ThresholdInputPT } from "@/lib/primereactPtClasses";

export default function ThresholdFilter({
    name,
    operator,
    onOperatorChange,
    operatorOptions,
    disabled,
    threshold,
    onThresholdChange,
    placeholder,
    step,
}: ThresholdFilterProps) {
    return (
        <div className="w-full flex gap-4">
            <div>
                <SelectButton
                    value={operator}
                    tooltip={`${name} less than or greater than`}
                    tooltipOptions={{ showDelay: 500, hideDelay: 300 }}
                    onChange={(e) => onOperatorChange(e.value)}
                    options={operatorOptions}
                    disabled={disabled}
                    className="transition-all duration-300"
                    pt={OperatorSelectButtonPT}
                />
            </div>
            <div>
                <InputNumber
                    value={threshold}
                    onValueChange={(e) => onThresholdChange(e.value!)}
                    mode="decimal"
                    min={0}
                    useGrouping={false}
                    maxFractionDigits={1}
                    placeholder={placeholder || ''}
                    suffix={` ${placeholder}`}
                    showButtons
                    step={step}
                    disabled={disabled}
                    className="transition-all duration-300"
                    pt={ThresholdInputPT}
                />
            </div>
        </div>
    );
}