import React, { ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form"
import { Label } from "@/components/ui/label";
import VStackComponent from '../common/vertical-stack.component';

type componentPropType = {
    inputName: string;
    control: any;
    labelName?: string;
    type?: string;
    errors: any;
    notShowLabel?: boolean;
    placeholder?: string;
    disabled?: boolean;
    step?: string | number;
    pattern?: string;
    [key: string]: any;
    onChangeHandler?: (e: ChangeEvent<HTMLInputElement>) => void
    doNotUseFieldOnChange?: boolean
    mainContainerClass?: string
    accept?: string
    multiple?: boolean
}

const ControllerInputComponent = ({ inputName, control, labelName, type, errors, notShowLabel, placeholder, disabled, onChangeHandler, doNotUseFieldOnChange, mainContainerClass, accept, multiple, step, pattern, ...rest }: componentPropType) => {
    return (
        <>
            <Controller
                name={inputName}
                control={control}
                render={({ field }) => {
                    return (
                        <VStackComponent className={`items-start ${mainContainerClass ? mainContainerClass : ''}`}>
                            {!notShowLabel && labelName && (
                                <Label htmlFor={inputName} className="text-left">
                                    {labelName}
                                </Label>
                            )}
                            <Input accept={accept} multiple={multiple} min={0} step={step} disabled={disabled} {...rest} {...field} value={field.value instanceof File ? undefined : field.value} onChange={(e) => {
                                if (!doNotUseFieldOnChange) {
                                    if (type === 'file' && e.target.files) {
                                        field.onChange(e.target.files[0])
                                    } else {
                                        field.onChange(e)
                                    }
                                }
                                onChangeHandler && onChangeHandler(e)
                            }} type={type} className="col-span-3" placeholder={placeholder} {...(type === 'time' ? { 'data-format': '24' } : {})}/>
                            {errors[inputName] && errors[inputName]?.message && <span className={"text-errorText text-sm font-bold"}>
                                {errors[inputName]?.message as never}
                            </span>
                            }
                        </VStackComponent>
                    )
                }}
            />
        </>
    );
};

export default ControllerInputComponent;
