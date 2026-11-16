import React from "react";
import Select, { MultiValue } from "react-select";
import makeAnimated from 'react-select/animated';

type componentPropType = {
    selectOption: { value: string, label: string }[]
    selectedValue: { value: string, label: string }[]
    onChange: (value: MultiValue<{ value: string; label: string; }>) => void
    placeholder: string
    disabled?: boolean
}

const animatedComponents = makeAnimated();

const MultiSelectCommon = ({selectOption, selectedValue, onChange, placeholder, disabled}: componentPropType) => {
    return (
        <Select
            defaultValue={selectedValue}
            isMulti
            isDisabled={disabled}
            components={animatedComponents}
            options={selectOption}
            closeMenuOnSelect={false}
            placeholder={placeholder}
            onChange={(newValue) => onChange(newValue)}
            styles={{
                control: (base, props) => ({
                    ...base,
                    backgroundColor: '#fff',
                    border: '1px solid hsl(214.3 31.8% 91.4%)',
                    height: '2.5rem',
                    fontSize: '0.8rem',
                    width: '100%'
                }),
                container: (base, props) => ({
                    ...base,
                    width: '100%'
                }),
                valueContainer: (base, props) => ({
                    ...base,
                    gap: '5px'
                }),
                menu: (base, props) => ({
                    ...base,
                    backgroundColor: '#fff',
                    border: 'none',
                    color: '#000'
                }),
                option: (base, props) => ({
                    ...base,
                    backgroundColor: props.isFocused ? 'rgb(0,0,0)' : '#fff',
                    color: props.isFocused ? '#fff' : '#242424',
                    borderRadius: '5px',
                    fontSize: '0.8rem',
                    width: '98%',
                    marginLeft: '1%'
                }),
                multiValue: (base, props) => ({
                    ...base,
                    backgroundColor: '#000',
                    color: '#fff',
                    borderRadius: '5px',
                    width: 'fit-content',
                    margin: 0
                }),
                multiValueLabel: (base, props) => ({
                    ...base,
                    color: '#fff',
                }),
            }}
        />
    );
};

export default MultiSelectCommon;
