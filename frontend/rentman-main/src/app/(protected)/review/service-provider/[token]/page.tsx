"use client"
import React, { useEffect, useMemo, useState } from 'react';
import EmptyComponent from "@/components/common/empty.component";
import { IEvent } from "@/interfaces/event.interfaces";
import { getClientEventDetails } from "@/redux/actions";
import useAuthRequest from "@/lib/useAuthRequest";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { IconsComponent } from "@/components/common/icons.component";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import { Button } from "@/components/ui/button";
import { number, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { axios } from "@/lib/axiosInstance";
import { useToast } from "@/components/ui/use-toast";
import { isEmpty } from "lodash";
import { useSession } from "next-auth/react";


const reviewFormSchema = object().shape({
    kilometer: number().required('Dit veld is verplicht.'),
    extra_cost: number().required('Dit veld is verplicht.'),
    extra_cost_description: string().required('Dit veld is verplicht.'),
    start_time: string().required('Dit veld is verplicht.'),
    end_time: string().required('Dit veld is verplicht.'),
    break_minutes: string().required('Dit veld is verplicht.'),
    // overtime: string().required('Dit veld is verplicht.'),
    // travel_time: string().required('Dit veld is verplicht.'),
})

const ReviewServiceProvider = () => {
    useAuthRequest()
    const [fetchSelectedEvent, setFetchSelectedEvent] = useState<boolean>(false)
    const [selectEvent, setSelectEvent] = useState<IEvent | null>(null)
    const [attachedFiles, setAttachedFiles] = useState([])
    const pathname = usePathname()
    const route = useRouter()
    const { toast } = useToast()
    const { data: session } = useSession()

    const isReviewed = useMemo(() => {
        if (selectEvent && session) {
            const { user } = session
            // Check if reviewed_by_service_provider exists and is not null
            if (selectEvent.reviewed_by_service_provider && typeof selectEvent.reviewed_by_service_provider === 'object') {
                const SPKeys = Object.keys(selectEvent.reviewed_by_service_provider)
                return SPKeys.some(key => {
                    return key === `${user.id}` && selectEvent.reviewed_by_service_provider[key];
                })
            }
        }
        return false
    }, [selectEvent, session])

    useEffect(() => {
        const fetchSelectedEvent = async () => {
            await getClientEventDetails(pathname.replace('/review/service-provider/', ''), ((event) => setSelectEvent(event)), undefined, setFetchSelectedEvent)
        }
        fetchSelectedEvent().then(null)
    }, [pathname]);

    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<any>({
        resolver: yupResolver(reviewFormSchema),
        defaultValues: {
            "kilometer": undefined,
            "extra_cost": undefined,
            "extra_cost_description": "",
            "start_time": "",
            "end_time": "",
            "break_minutes": "",
            "status": "PENDING"
        },
    })

    const handleReviewSubmit = async (data: any) => {
        if (session) {
            const { user } = session;
            const formData = new FormData();

            const formattedData = {
                ...data,
                service_provider: { id: user.id },
                attachedFiles: undefined
            };

            formData.append('invoice', JSON.stringify(formattedData));

            if (data.attachedFiles && data.attachedFiles.length > 0) {
                for (let i = 0; i < data.attachedFiles.length; i++) {
                    formData.append('files', data.attachedFiles[i]);
                }
            }
            try {
                const reviewForm = await axios.post(
                    `/job/review-form/service-provider?token=${pathname.replace('/review/service-provider/', '')}`,
                    formData
                );

                if (reviewForm.status === 200) {
                    toast({
                        description: "Review submitted successfully.",
                    });
                    route.replace('/dashboard');
                } else {
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "Try again later.",
                    });
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: message,
                });
            }
        }
    };


    if (fetchSelectedEvent) {
        return (
            <div className={'h-screen flex items-center justify-center'}>
                <IconsComponent.spinner className="mr-2 h-6 w-6 mb-1 animate-spin" /><p>Laden</p>
            </div>
        )
    }

    if (isReviewed) {
        return (
            <div className={'h-[85vh] bg-gray-200 rounded-md shadow w-full'}>
                <EmptyComponent text={'Review has already being submitted'} className={'h-full'} />
            </div>
        )
    }
    return (
        <>
            <div className={'flex gap-4 -mt-6'}>
                <h1 className={'font-bold text-lg'}>Review Form</h1>
            </div>
            <form onSubmit={handleSubmit(handleReviewSubmit)}>
                <div className={"flex flex-col gap-4 w-full border rounded my-4 p-3"}>
                    <HStackComponent className={"items-start"}>
                        <ControllerInputComponent
                            placeholder='HH:MM'
                            type='text'
                            pattern='[0-2][0-9]:[0-5][0-9]'
                            errors={errors}
                            control={control}
                            inputName={'start_time'}
                            labelName={'Start Time'}
                            onChangeHandler={(e) => {
                                let value = e.target.value;
                                value = value.replace(/[^\d:]/g, '');
                                value = value.replace(/:/g, '');
                                value = value.slice(0, 4);
                                if (value.length > 2) {
                                    value = value.slice(0, 2) + ':' + value.slice(2);
                                }
                                const hours = value.slice(0, 2);
                                if (hours && parseInt(hours) > 23) {
                                    value = '23' + value.slice(2);
                                }
                                if (value.length >= 5) {
                                    const minutes = value.slice(3, 5);
                                    if (parseInt(minutes) > 59) {
                                        value = value.slice(0, 3) + '59';
                                    }
                                }
                                setValue('start_time', value);
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
                                let value = e.target.value;
                                value = value.replace(/[^\d:]/g, '');
                                value = value.replace(/:/g, '');
                                value = value.slice(0, 4);
                                if (value.length > 2) {
                                    value = value.slice(0, 2) + ':' + value.slice(2);
                                }
                                const hours = value.slice(0, 2);
                                if (hours && parseInt(hours) > 23) {
                                    value = '23' + value.slice(2);
                                }
                                if (value.length >= 5) {
                                    const minutes = value.slice(3, 5);
                                    if (parseInt(minutes) > 59) {
                                        value = value.slice(0, 3) + '59';
                                    }
                                }
                                setValue('end_time', value);
                            }}
                            doNotUseFieldOnChange
                        />
                        <ControllerInputComponent
                            placeholder='HH:MM'
                            type='text'
                            errors={errors}
                            control={control}
                            inputName={'break_minutes'}
                            labelName={'Break'}
                            onChangeHandler={(e) => {
                                let value = e.target.value;
                                value = value.replace(/[^\d:]/g, '');
                                value = value.replace(/:/g, '');
                                value = value.slice(0, 4);
                                if (value.length > 2) {
                                    value = value.slice(0, 2) + ':' + value.slice(2);
                                }
                                const hours = value.slice(0, 2);
                                if (hours && parseInt(hours) > 23) {
                                    value = '23' + value.slice(2);
                                }
                                if (value.length >= 5) {
                                    const minutes = value.slice(3, 5);
                                    if (parseInt(minutes) > 59) {
                                        value = value.slice(0, 3) + '59';
                                    }
                                }
                                setValue('break_minutes', value);
                            }}
                            doNotUseFieldOnChange />
                    </HStackComponent>

                    {/* <HStackComponent className={"items-start"}>
                        <ControllerInputComponent
                            placeholder='00:00'
                            type='text'
                            errors={errors}
                            control={control}
                            inputName={'overtime'}
                            labelName={'Overtime (minutes)'}
                            onChangeHandler={(e) => {
                                let value = e.target.value;
                                value = value.replace(/[^\d]/g, '').slice(0, 3);
                                setValue('overtime', value);
                            }}
                            doNotUseFieldOnChange />
                    </HStackComponent> */}

                    <HStackComponent className={"items-start"}>
                        <ControllerInputComponent
                            placeholder='Enter kilometers here...'
                            errors={errors}
                            onChangeHandler={(e) => {
                                const regex = /^[0-9]+$/;
                                if (regex.test(e.target.value) || isEmpty(e.target.value)) {
                                    setValue('kilometer', e.target.value)
                                }
                            }}
                            doNotUseFieldOnChange
                            control={control} inputName={'kilometer'}
                            labelName={'Travel (KM)'} />
                        {/* <ControllerInputComponent
                            placeholder='00:00'
                            type='text'
                            errors={errors}
                            control={control}
                            inputName={'travel_time'}
                            labelName={'Travel Time (minutes)'}
                            onChangeHandler={(e) => {
                                let value = e.target.value;
                                value = value.replace(/[^\d]/g, '').slice(0, 3);
                                setValue('travel_time', value);
                            }}
                            doNotUseFieldOnChange /> */}
                        <ControllerInputComponent placeholder='Enter your extra cost here...'
                            errors={errors}
                            onChangeHandler={(e) => {
                                const regex = /^[0-9]+$/;
                                if (regex.test(e.target.value) || isEmpty(e.target.value)) {
                                    setValue('extra_cost', e.target.value)
                                }
                            }}
                            doNotUseFieldOnChange
                            control={control} inputName={'extra_cost'}
                            labelName={'Extra cost'} />
                    </HStackComponent>

                    <ControllerTextareaComponent placeholder='Share where was this extra cost used...'
                        errors={errors} control={control} inputName={'extra_cost_description'}
                        labelName={'Description'} />

                    <ControllerInputComponent placeholder='' type='file' accept={'image/*'} multiple
                        errors={errors} control={control} inputName={'attachedFiles'}
                        labelName={'Files'} doNotUseFieldOnChange onChangeHandler={(e) => {
                            setValue('attachedFiles', undefined)
                            if (e.target.files && e.target.files.length > 0) {
                                Array.from({ length: e.target.files.length }, (_, i) => i).map((value) => {
                                    setValue(`attachedFiles[${value}]`, e.target?.files ? e.target?.files[value] : '')
                                })
                            }
                        }}
                    />
                </div>
                <div className={'flex justify-end mt-4'}>
                    <Button type={"submit"}>Submit review</Button>
                </div>
            </form>
        </>
    );
};

export default ReviewServiceProvider;
