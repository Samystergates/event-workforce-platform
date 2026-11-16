import React from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"

type componentPropType = {
    selectOption: { value: number | string, label: string }[],
    placeholder: string,
    selectedValue?: string | number | null,
    onChange: (e: any) => void
    disabled?: boolean
}

const CommonSelectComponent = ({selectedValue, selectOption, onChange, placeholder, disabled}: componentPropType) => {
    const hasValue = selectedValue !== undefined && selectedValue !== null && `${selectedValue}` !== '';
    const value = hasValue ? `${selectedValue}` : undefined;
    return (
        <Select onValueChange={onChange} value={value} defaultValue={value} disabled={disabled}>
            <SelectTrigger className={`${value ? undefined : 'text-[#67768d]'}`}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {selectOption.map(option => (
                    <SelectItem key={option.value} value={`${option.value}`}>{option.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default CommonSelectComponent;
