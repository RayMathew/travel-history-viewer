import React from "react";
import { SelectButton } from "primereact/selectbutton";
import { InputNumber } from "primereact/inputnumber";
import { ThresholdFilterProps } from "@/lib/types/frontend";

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
                    pt={{
                        root: {
                            className: 'flex flex-nowrap'
                        },
                        button: {
                            className: '!py-2'
                        }
                    }}
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
                    // buttonLayout="vertical"
                    // decrementButtonClassName="p-button-secondary"
                    // incrementButtonClassName="p-button-secondary"
                    // incrementButtonIcon="pi pi-plus"
                    // decrementButtonIcon="pi pi-minus"
                    pt={{
                        input: {
                            root: {
                                className: '!py-2 w-full rounded-none rounded-l-md dark:focus:shadow-none'
                            },
                        },
                        incrementButton: {
                            className: 'border border-l-0 border-b-0 rounded-r-md dark:bg-gray-900 dark:border-blue-900/40 dark:hover:bg-gray-800/80'
                        },
                        decrementButton: {
                            className: 'border border-l-0 border-t-0 rounded-r-md dark:bg-gray-900 dark:border-blue-900/40 dark:hover:bg-gray-800/80'
                        }
                    }}
                />
            </div>
        </div>
    );
}