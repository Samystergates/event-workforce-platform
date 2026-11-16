"use client"
import React, {ChangeEvent} from 'react';
import {Controller} from "react-hook-form"
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import VStackComponent from "@/components/common/vertical-stack.component";

type componentPropType = {
    inputName: string;
    control: any;
    labelName: string;
    errors: any;
    notShowLabel?: boolean;
    placeholder?: string;
    disabled?: boolean;
    onChangeHandler?: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

const ControllerTextareaComponent = ({inputName, control, labelName, errors, notShowLabel, placeholder, disabled,onChangeHandler}: componentPropType) => {
    return (
        <>
            <Controller
                name={inputName}
                control={control}
                render={({field}) => (
                    <VStackComponent className={'items-start'}>
                        {!notShowLabel && (
                            <Label htmlFor={inputName} className="text-left">
                                {labelName}
                            </Label>
                        )}
                        <Textarea disabled={disabled} {...field} onChange={(e) => {
                            field.onChange(e)
                            onChangeHandler && onChangeHandler(e)
                        }} className="col-span-3" placeholder={placeholder}/>
                        {errors[inputName] && errors[inputName]?.message && <span className={"text-errorText text-sm font-bold"}>
                            {errors[inputName]?.message as never}
                        </span>
                        }
                    </VStackComponent>
                )}
            />
        </>
    );
};

export default ControllerTextareaComponent;
