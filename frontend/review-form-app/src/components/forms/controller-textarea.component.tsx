import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Control, Controller, FieldErrors, FieldValues, Path } from "react-hook-form"
import { Label } from "@/components/ui/label"
import VStackComponent from '../common/vertical-stack.component'

interface ControllerTextareaProps<
    TFieldValues extends FieldValues = FieldValues,
    TContext = unknown,
    TTransformedValues extends FieldValues = TFieldValues,
> {
    inputName: Path<TFieldValues> | string
    control: Control<TFieldValues, TContext, TTransformedValues>
    labelName?: string
    errors: FieldErrors<TFieldValues>
    placeholder?: string
    disabled?: boolean
}

const ControllerTextareaComponent = <
    TFieldValues extends FieldValues = FieldValues,
    TContext = unknown,
    TTransformedValues extends FieldValues = TFieldValues,
>({
    inputName,
    control,
    labelName,
    errors,
    placeholder,
    disabled,
}: ControllerTextareaProps<TFieldValues, TContext, TTransformedValues>) => {
    return (
        <Controller<TFieldValues, Path<TFieldValues>, TTransformedValues>
            name={inputName as Path<TFieldValues>}
            control={control}
            render={({ field }) => {
                const fieldKey = inputName as keyof FieldErrors<TFieldValues>
                const fieldError = errors[fieldKey]

                return (
                    <VStackComponent className="items-start">
                        {labelName && (
                            <Label htmlFor={String(inputName)} className="text-left">
                                {labelName}
                            </Label>
                        )}
                        <Textarea
                            {...field}
                            value={field.value ?? ''}
                            disabled={disabled}
                            placeholder={placeholder}
                            className="col-span-3"
                        />
                        {fieldError && 'message' in fieldError && (
                            <p className="text-red-500 text-sm mt-1">
                                {String(fieldError.message)}
                            </p>
                        )}
                    </VStackComponent>
                )
            }}
        />
    )
}

export default ControllerTextareaComponent
