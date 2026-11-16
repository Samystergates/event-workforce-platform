"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { validateToken } from "@/redux/actions";
import useAuthRequest from "@/lib/useAuthRequest";
import { usePathname, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { IconsComponent } from "@/components/common/icons.component";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { boolean, InferType, mixed, number, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { axiosInstance } from "@/lib/axiosInstance";
import { useToast } from "@/components/ui/use-toast";
import { isEmpty } from "lodash";
import ReviewErrorState from "@/components/review/review-error-state";

const reviewFormSchema = object({
    kilometer: number()
        .transform((value, originalValue) => originalValue === '' ? undefined : value)
        .optional()
        .test('required', 'Dit veld is verplicht.', (value) => value !== undefined),
    extra_cost: number()
        .transform((value, originalValue) => originalValue === '' ? undefined : value)
        .optional()
        .test('required', 'Dit veld is verplicht.', (value) => value !== undefined),
    extra_cost_description: string().required('Dit veld is verplicht.'),
    start_time: string().required('Dit veld is verplicht.'),
    end_time: string().required('Dit veld is verplicht.'),
    break_minutes: string().required('Dit veld is verplicht.'),
    own_car: boolean().required('Dit veld is verplicht.'),
    status: mixed<'PENDING'>().oneOf(['PENDING']).required(),
    attachedFiles: mixed<File[]>().optional(),
})

type ReviewFormInput = {
    kilometer: number | undefined
    extra_cost: number | undefined
    extra_cost_description: string
    start_time: string
    end_time: string
    break_minutes: string
    own_car: boolean
    status: 'PENDING'
    attachedFiles: File[] | undefined
}

type ReviewFormOutput = InferType<typeof reviewFormSchema>

const ReviewServiceProvider = () => {
    const session = useAuthRequest()
    const [fetchSelectedEvent, setFetchSelectedEvent] = useState<boolean>(false)
    const [hasError, setHasError] = useState(false)
    const pathname = usePathname()
    const route = useRouter()
    const { toast } = useToast()

    const checkToken = useCallback(async () => {
        const token = pathname.split('/').pop() || ''

        setHasError(false)

        await validateToken(
            token,
            (isValid) => {
                if (isValid) {
                    route.push('/review/already-filled')
                }
            },
            (error) => {
                console.error('Token validation failed:', error)
                setHasError(true)
            },
            setFetchSelectedEvent
        )
    }, [pathname, route])

    useEffect(() => {
        checkToken()
    }, [checkToken])

    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<ReviewFormInput, unknown, ReviewFormOutput>({
        resolver: yupResolver(reviewFormSchema),
        defaultValues: {
            kilometer: undefined,
            extra_cost: undefined,
            extra_cost_description: '',
            start_time: '',
            end_time: '',
            break_minutes: '',
            status: 'PENDING',
            attachedFiles: undefined,
            own_car: false,
        },
    })

    const handleReviewSubmit = async (data: ReviewFormOutput) => {
        if (session?.user) {
            const formData = new FormData()
            const { attachedFiles, ...rest } = data

            formData.append('form', JSON.stringify(rest))

            if (attachedFiles && attachedFiles.length > 0) {
                attachedFiles.forEach((file) => {
                    formData.append('files', file)
                })
            }

            try {
                const token = pathname.split('/').pop() || ''
                const reviewForm = await axiosInstance.post(
                    `/form/review-form/service-provider?token=${token}`,
                    formData
                )

                if (reviewForm.status === 200) {
                    toast({
                        description: "Review submitted successfully.",
                    })
                    route.replace('/review/success')
                } else {
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "Try again later.",
                    })
                }
            } catch (error) {
                console.error('Error submitting review form:', error)
                setHasError(true)

                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "Try again later.",
                })
            }
        }
    }

    if (hasError) {
        return <ReviewErrorState onRetry={() => checkToken()} />
    }

    if (fetchSelectedEvent) {
        return (
            <div className={'h-screen flex items-center justify-center'}>
                <IconsComponent.spinner className="mr-2 h-6 w-6 mb-1 animate-spin" /><p>Laden</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="mb-8 text-center">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-3 h-8 w-8 text-blue-600"
                                >
                                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                                </svg>
                                Eventico
                            </h1>
                            <p className="text-gray-600">Please fill in all the required details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-6">
                        <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
                                    Time Information
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ControllerInputComponent
                                    placeholder='HH:MM'
                                    type='text'
                                    pattern='[0-2][0-9]:[0-5][0-9]'
                                    errors={errors}
                                    control={control}
                                    inputName={'start_time'}
                                    labelName={'Start Time'}
                                    onChangeHandler={(e) => {
                                        let value = e.target.value
                                        value = value.replace(/[^\d:]/g, '')
                                        value = value.replace(/:/g, '')
                                        value = value.slice(0, 4)
                                        if (value.length > 2) {
                                            value = value.slice(0, 2) + ':' + value.slice(2)
                                        }
                                        const hours = value.slice(0, 2)
                                        if (hours && parseInt(hours) > 23) {
                                            value = '23' + value.slice(2)
                                        }
                                        if (value.length >= 5) {
                                            const minutes = value.slice(3, 5)
                                            if (parseInt(minutes) > 59) {
                                                value = value.slice(0, 3) + '59'
                                            }
                                        }
                                        setValue('start_time', value)
                                    }}
                                    doNotUseFieldOnChange
                                />
                                <ControllerInputComponent
                                    placeholder='HH:MM'
                                    type='text'
                                    pattern='[0-2][0-9]:[0-5][0-9]'
                                    errors={errors}
                                    control={control}
                                    inputName={'end_time'}
                                    labelName={'End Time'}
                                    onChangeHandler={(e) => {
                                        let value = e.target.value
                                        value = value.replace(/[^\d:]/g, '')
                                        value = value.replace(/:/g, '')
                                        value = value.slice(0, 4)
                                        if (value.length > 2) {
                                            value = value.slice(0, 2) + ':' + value.slice(2)
                                        }
                                        const hours = value.slice(0, 2)
                                        if (hours && parseInt(hours) > 23) {
                                            value = '23' + value.slice(2)
                                        }
                                        if (value.length >= 5) {
                                            const minutes = value.slice(3, 5)
                                            if (parseInt(minutes) > 59) {
                                                value = value.slice(0, 3) + '59'
                                            }
                                        }
                                        setValue('end_time', value)
                                    }}
                                    doNotUseFieldOnChange
                                />
                                <ControllerInputComponent
                                    placeholder='HH:MM'
                                    type='text'
                                    pattern='[0-2][0-9]:[0-5][0-9]'
                                    errors={errors}
                                    control={control}
                                    inputName={'break_minutes'}
                                    labelName={'Break Duration'}
                                    onChangeHandler={(e) => {
                                        let value = e.target.value
                                        value = value.replace(/[^\d:]/g, '')
                                        value = value.replace(/:/g, '')
                                        value = value.slice(0, 4)
                                        if (value.length > 2) {
                                            value = value.slice(0, 2) + ':' + value.slice(2)
                                        }
                                        const hours = value.slice(0, 2)
                                        if (hours && parseInt(hours) > 23) {
                                            value = '23' + value.slice(2)
                                        }
                                        if (value.length >= 5) {
                                            const minutes = value.slice(3, 5)
                                            if (parseInt(minutes) > 59) {
                                                value = value.slice(0, 3) + '59'
                                            }
                                        }
                                        setValue('break_minutes', value)
                                    }}
                                    doNotUseFieldOnChange
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
                                    Travel & Expenses
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ControllerInputComponent
                                    placeholder='Enter kilometers here...'
                                    errors={errors}
                                    onChangeHandler={(e) => {
                                        const regex = /^[0-9]+$/
                                        if (regex.test(e.target.value) || isEmpty(e.target.value)) {
                                            setValue('kilometer', e.target.value === '' ? undefined : Number(e.target.value))
                                        }
                                    }}
                                    doNotUseFieldOnChange
                                    control={control}
                                    inputName={'kilometer'}
                                    labelName={'Travel Distance (KM)'}
                                />
                                <ControllerInputComponent
                                    placeholder='Enter your extra cost here...'
                                    errors={errors}
                                    onChangeHandler={(e) => {
                                        const regex = /^[0-9]+$/
                                        if (regex.test(e.target.value) || isEmpty(e.target.value)) {
                                            setValue('extra_cost', e.target.value === '' ? undefined : Number(e.target.value))
                                        }
                                    }}
                                    doNotUseFieldOnChange
                                    control={control}
                                    inputName={'extra_cost'}
                                    labelName={'Additional Costs'}
                                />
                            </div>

                            <ControllerTextareaComponent
                                placeholder='Please describe what the additional costs were for...'
                                errors={errors}
                                control={control}
                                inputName={'extra_cost_description'}
                                labelName={'Cost Description'}
                            />

                            <Controller
                                name={'own_car'}
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center space-x-3">
                                        <input
                                            id="own_car"
                                            type="checkbox"
                                            checked={Boolean(field.value)}
                                            onChange={(event) => field.onChange(event.target.checked)}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Label htmlFor="own_car" className="text-sm text-gray-700">
                                            eigen auto
                                        </Label>
                                    </div>
                                )}
                            />
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">3</span>
                                    Supporting Documents
                                </h2>
                            </div>

                            <ControllerInputComponent
                                placeholder=''
                                type='file'
                                accept={'image/*'}
                                multiple
                                errors={errors}
                                control={control}
                                inputName={'attachedFiles'}
                                labelName={'Upload Files (Images Only)'}
                                doNotUseFieldOnChange
                                onChangeHandler={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setValue('attachedFiles', Array.from(e.target.files))
                                    } else {
                                        setValue('attachedFiles', undefined)
                                    }
                                }}
                            />
                        </div>

                        <div className="flex justify-end pt-6">
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                            >
                                Submit Review
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ReviewServiceProvider
