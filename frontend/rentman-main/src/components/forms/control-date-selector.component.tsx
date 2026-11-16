import React from 'react';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {CalendarIcon} from "lucide-react"
import {cn} from "@/lib/utils";
import {Controller} from "react-hook-form"
import {Calendar} from "@/components/ui/calendar";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import moment from "moment";
import VStackComponent from "@/components/common/vertical-stack.component";

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
    mainContainerClass?: string
}

const ControlDateSelectorComponent = ({
                                          inputName,
                                          control,
                                          labelName,
                                          errors,
                                          notShowLabel,
                                          placeholder,
                                          disabled,
                                          onChange,
                                          mainContainerClass
                                      }: componentPropType) => {
    return (
        <Controller
            name={inputName}
            control={control}
            render={({field}) => (
                <VStackComponent className={`items-start ${mainContainerClass ? mainContainerClass : ''}`}>
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
                                    moment(field.value).format('MMMM, DD YYYY')
                                ) : (
                                    <span>{placeholder}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={new Date(moment(field.value).format('YYYY-MM-DD HH:mm:ss'))}
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

export default ControlDateSelectorComponent;
