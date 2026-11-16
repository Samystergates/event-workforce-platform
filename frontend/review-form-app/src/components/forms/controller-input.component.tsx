import React, { ChangeEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Control, Controller, FieldErrors, FieldValues, Path } from "react-hook-form"
import { Label } from "@/components/ui/label"
import VStackComponent from '../common/vertical-stack.component'

interface ControllerInputProps<
    TFieldValues extends FieldValues = FieldValues,
    TContext = unknown,
    TTransformedValues extends FieldValues = TFieldValues,
> {
    inputName: Path<TFieldValues> | string
    control: Control<TFieldValues, TContext, TTransformedValues>
    labelName?: string
    type?: string
    errors: FieldErrors<TFieldValues>
    notShowLabel?: boolean
    placeholder?: string
    disabled?: boolean
    step?: string | number
    pattern?: string
    onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void
    doNotUseFieldOnChange?: boolean
    mainContainerClass?: string
    accept?: string
    multiple?: boolean
}

const ControllerInputComponent = <
    TFieldValues extends FieldValues = FieldValues,
    TContext = unknown,
    TTransformedValues extends FieldValues = TFieldValues,
>({
    inputName,
    control,
    labelName,
    type,
    errors,
    notShowLabel,
    placeholder,
    disabled,
    onChangeHandler,
    doNotUseFieldOnChange,
    mainContainerClass,
    accept,
    multiple,
    step,
    pattern,
}: ControllerInputProps<TFieldValues, TContext, TTransformedValues>) => {
    return (
        <Controller<TFieldValues, Path<TFieldValues>, TTransformedValues>
            name={inputName as Path<TFieldValues>}
            control={control}
            render={({ field }) => {
                const fieldKey = inputName as keyof FieldErrors<TFieldValues>
                const fieldError = errors[fieldKey]

                return (
                    <VStackComponent className={`items-start ${mainContainerClass || ''}`}>
                        {!notShowLabel && labelName && (
                            <Label htmlFor={String(inputName)} className="text-left">
                                {labelName}
                            </Label>
                        )}
                        <Input
                            accept={accept}
                            multiple={multiple}
                            min={0}
                            step={step}
                            disabled={disabled}
                            pattern={pattern}
                            {...field}
                            value={type === 'file' ? undefined : field.value ?? ''}
                            onChange={(event) => {
                                if (!doNotUseFieldOnChange) {
                                    if (type === 'file' && event.target.files) {
                                        field.onChange(event.target.files[0])
                                    } else {
                                        field.onChange(event)
                                    }
                                }
                                if (onChangeHandler) {
                                    onChangeHandler(event)
                                }
                            }}
                            type={type}
                            className="col-span-3"
                            placeholder={placeholder}
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

export default ControllerInputComponent
