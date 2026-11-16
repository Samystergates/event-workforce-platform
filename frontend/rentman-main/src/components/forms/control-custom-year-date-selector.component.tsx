import React from 'react';
import {Controller} from "react-hook-form";
import VStackComponent from "@/components/common/vertical-stack.component";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import moment from "moment/moment";

type componentPropType = {
    inputName: string;
    control: any;
    labelName: string;
    type?: string;
    errors: any;
    notShowLabel?: boolean;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (e: string) => void
}

const ControlCustomYearDateSelectorComponent = ({
                                                    inputName,
                                                    control,
                                                    labelName,
                                                    errors,
                                                    notShowLabel,
                                                    placeholder,
                                                    disabled,
                                                    onChange
                                                }: componentPropType) => {
    return (
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                disabled={disabled}
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>{placeholder}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={new Date(field.value)}
                                captionLayout="dropdown" fromYear={1970} toYear={2025}
                                onSelect={(e) => {
                                    field.onChange(moment(e).format('YYYY-MM-DD'))
                                    onChange && onChange(moment(e).format('YYYY-MM-DD'))
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors[inputName] && errors[inputName]?.message &&
                        <span className={"text-errorText text-sm font-bold"}>
                            {errors[inputName]?.message as never}
                        </span>
                    }
                </VStackComponent>
            )}
        />
    );
};

export default ControlCustomYearDateSelectorComponent;
