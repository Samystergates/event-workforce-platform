"use client"
import React, {useEffect, useMemo, useState} from 'react';
import {usePathname, useRouter} from "next/navigation";
import HStackComponent from '@/components/common/horizontal-stack.component';
import ControllerInputComponent from "@/components/forms/controller-input.component";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {EventFormSchema} from "@/app/(protected)/dashboard/validation/event-form.schema";
import {format, formatTimeArrayForInput, formatTimeArrayToString} from "@/util/common";
import moment from "moment/moment";
import {saveSkill} from "@/redux/reducers/skillReducers";
import {getAllSkills} from "@/redux/actions/skillActions";
import {getAllServiceProviders, getClientEventDetails} from "@/redux/actions";
import {IEvent} from "@/interfaces/event.interfaces";
import useAuthRequest from "@/lib/useAuthRequest";
import {useAppDispatch} from "@/redux/hooks";
import {useToast} from "@/components/ui/use-toast";
import {useSession} from "next-auth/react";
import ControlDateSelectorComponent from "@/components/forms/control-date-selector.component";
import VStackComponent from "@/components/common/vertical-stack.component";
import {Label} from "@/components/ui/label";
import MultiSelectCommon from "@/components/common/common-multiselect.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import {IconsComponent} from '@/components/common/icons.component';
import ServiceProviderCard from "@/components/common/service-providers-card.component";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {axios} from "@/lib/axiosInstance";
import EmptyComponent from "@/components/common/empty.component";

const ReviewClient = () => {
    useAuthRequest()
    const dispatch = useAppDispatch()
    const {toast} = useToast()
    const {data: session} = useSession()
    const [showError, setShowError] = useState<boolean>(false)
    const [fetchSelectedEvent, setFetchSelectedEvent] = useState<boolean>(false)
    const [skillSet, setSkillSet] = useState<{ value: number, label: string }[]>([]);
    const [loadSkills, setLoadSkills] = useState<boolean>(false);
    const [serviceProviderLoading, setServiceProviderLoading] = useState<boolean>(false);
    const [selectEvent, setSelectEvent] = useState<IEvent | null>(null)
    const [ratingUserInfo, setRatingUserInfo] = useState<{rating: number, serviceProviderId: number}[]>([])
    const pathname = usePathname()
    const route = useRouter()

    const bgColor = useMemo(() => selectEvent?.status === 'WAITING' ? 'bg-yellow-600' : selectEvent?.status === 'STARTED' ? 'bg-green-900' : selectEvent?.status === 'ACCEPTED' ? 'bg-blue-900' : selectEvent?.status === 'COMPLETED' ? '' : 'bg-red-900', [selectEvent]);

    useEffect(() => {
        const fetchSelectedEvent = async () => {
            await getClientEventDetails(pathname.replace('/review/client/', ''), ((event) => setSelectEvent(event)), setValue, setFetchSelectedEvent)
        }
        fetchSelectedEvent().then(null)
    }, [pathname]);

    useEffect(() => {
        dispatch(saveSkill(skillSet.map(value => ({id: value.value, name: value.label}))))
    }, [skillSet]);

    useEffect(() => {
        getAllSkills(setLoadSkills, setSkillSet).then(null)
        getAllServiceProviders(setServiceProviderLoading).then(null)
    }, []);

    const {
        control,
        setValue,
        formState: {errors},
    } = useForm<any>({
        resolver: yupResolver(EventFormSchema()),
        defaultValues: {
            active: true,
            title: selectEvent ? selectEvent.title : '',
            destination: selectEvent ? selectEvent.destination : '',
            role: selectEvent ? selectEvent.role : '',
            description: selectEvent ? selectEvent.description : '',
            client: selectEvent ? selectEvent.client?.id : '',
            moderator: selectEvent ? selectEvent.moderator?.id : '',
            created_by: selectEvent ? selectEvent.created_by?.id : '',
            start_time: selectEvent ? selectEvent?.start_time?.map(value => format(`${value}`))?.join(':') : '',
            end_time: selectEvent ? selectEvent?.end_time?.map(value => format(`${value}`))?.join(':') : '',
            project_lead_name: selectEvent ? selectEvent.project_lead_name : '',
            project_lead_number: selectEvent ? selectEvent.project_lead_number : '',
            number_of_people: selectEvent ? selectEvent.number_of_people : '',
            required_skills: selectEvent ? selectEvent.required_skills.map(skill => skill.id) : '',
            potential_service_providers: selectEvent ? selectEvent.potential_service_providers.map(service_providers => service_providers.service_provider_id) : '',
            start_date: selectEvent ? moment(selectEvent.start_date.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD') : '',
            end_date: selectEvent ? moment(selectEvent.end_date.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD') : '',
        },
    })

    const onRatingClickHandler = (value: {rating: number, serviceProviderId: number}) => {
        setShowError(false)
        setRatingUserInfo(prevState => {
            if (prevState.find(findState => findState.serviceProviderId === value.serviceProviderId)) {
                return prevState.map(state => {
                    if (state.serviceProviderId === value.serviceProviderId) {
                        return value
                    }
                    return state
                })
            }

            return ([...prevState, value])
        })
    }

    const handleSubmitReview = async () => {
        setShowError(false)
        if (ratingUserInfo.length === selectEvent?.service_providers_list.length) {
            const reviewForm = await axios.post(`/job/review-form/client?token=${pathname.replace('/review/client/', '')}`, ratingUserInfo)
            if (reviewForm.status === 200) {
                toast({
                    description: "Review submitted successfully.",
                })
                route.replace('/dashboard')
            } else {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "Try again later.",
                })
            }
        } else {
            setShowError(true)
        }
    }

    if (!session) return <></>

    if (serviceProviderLoading || serviceProviderLoading || fetchSelectedEvent) {
        return (
            <div className={'h-screen flex items-center justify-center'}>
                <IconsComponent.spinner className="mr-2 h-6 w-6 mb-1 animate-spin"/><p>Laden</p>
            </div>
        )
    }

    if (selectEvent?.reviewed_by_client) {
        return (
            <div className={'h-[85vh] bg-gray-200 rounded-md shadow w-full'}>
                <EmptyComponent text={'Review has already being submitted'} className={'h-full'}/>
            </div>
        )
    }

    return (
        <>
            <div className={'flex gap-4 -mt-6'}>
                <h1 className={'font-bold text-lg'}>Event Details</h1>
                <Badge variant={"default"} className={bgColor}>{selectEvent?.status?.replace('_', ' ')}</Badge>
            </div>
            <form className={"flex flex-col gap-4 w-full border rounded my-4 p-3"}>
                <HStackComponent>
                    <ControllerInputComponent disabled placeholder='Enter your title here...'
                                              errors={errors}
                                              control={control} inputName={'title'}
                                              labelName={'Title'}/>
                </HStackComponent>
                <HStackComponent className={'items-start'}>
                    <ControllerInputComponent disabled placeholder='Enter your number of people required here...'
                                              errors={errors}
                                              type={'number'}
                                              control={control} inputName={'number_of_people'}
                                              labelName={'Number of people'}/>
                    <ControllerInputComponent disabled placeholder='Enter your role here...'
                                              errors={errors}
                                              control={control} inputName={'role'}
                                              labelName={'role'}/>
                    {session.user.depId === 2 && <ControllerInputComponent disabled
                        placeholder='Enter the invoice number here...'
                        errors={errors}
                        control={control} inputName={'invoice'}
                        labelName={'invoice'}/>}
                </HStackComponent>
                <HStackComponent className={'items-start'}>
                    <ControllerInputComponent disabled placeholder='Enter project lead name here...'
                                              errors={errors}
                                              control={control} inputName={'project_lead_name'}
                                              labelName={'Project lead name'}/>
                    <ControllerInputComponent disabled placeholder='Enter project lead number here...'
                                              errors={errors}
                                              control={control} inputName={'project_lead_number'}
                                              doNotUseFieldOnChange
                                              labelName={'Project lead number'}/>
                </HStackComponent>
                <HStackComponent className={'items-start'}>
                    <ControllerInputComponent disabled placeholder='Enter shift start time here (00:00 AM)...'
                                              errors={errors}
                                              type={'time'}
                                              control={control} inputName={'start_time'}
                                              labelName={'Shift start time'}/>
                    <ControllerInputComponent disabled placeholder='Enter shift end time here (00:00 AM)...'
                                              errors={errors}
                                              type={'time'}
                                              control={control} inputName={'end_time'}
                                              labelName={'Shift end time'}/>
                </HStackComponent>
                <ControllerTextareaComponent disabled placeholder='Enter the description here...'
                                             errors={errors} control={control} inputName={'description'}
                                             labelName={'Description'}/>
                <VStackComponent className={'items-start'}>
                    <Label htmlFor={'Skills'} className="text-left">
                        Skills
                    </Label>
                    <HStackComponent>
                        <Controller
                            name={'required_skills'}
                            control={control}
                            render={({field}) => (
                                <HStackComponent className={'gap-2'}>
                                    <MultiSelectCommon disabled placeholder={'Select required skills.'}
                                                       onChange={(e) => {
                                                       }}
                                                       selectedValue={field.value ? skillSet.filter(clients => field.value.includes(clients.value)).map(value => ({
                                                           value: `${value.value}`,
                                                           label: value.label
                                                       })) : []}
                                                       selectOption={skillSet.map(value => ({
                                                           value: `${value.value}`,
                                                           label: value.label
                                                       }))}/>
                                    {loadSkills && (
                                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                                    )}
                                </HStackComponent>
                            )}
                        />
                    </HStackComponent>
                    {errors['required_skills'] && errors['required_skills']?.message &&
                        <span className={"text-errorText text-sm font-bold"}>
                            {errors['required_skills']?.message as never}
                        </span>
                    }
                </VStackComponent>
                <ControllerTextareaComponent disabled placeholder='Enter the destination here...'
                                             errors={errors} control={control} inputName={'destination'}
                                             labelName={'Destination'}/>
            </form>
            <h1 className={'font-bold text-lg'}>Freelancers</h1>
            <div className={'flex flex-wrap gap-2 mt-4'}>
                {selectEvent?.service_providers_list.map((value, key) => (
                    <ServiceProviderCard
                        key={key}
                        item={{
                            ...value,
                            name: `${value.first_name} ${value.last_name ?? ''}`,
                            profile_image: value.profile_image ? `${process.env.NEXT_PUBLIC_URL}/user/getUserProfileImage/${value.profile_image}` : undefined,
                            street: value.street ?? '',
                            zip: value.zip ?? '',
                            city: value.city ?? '',
                            contact: value.contact ?? '',
                            age: value.date_of_birth ? Number(moment().format('YYYY')) - Number(moment(new Date(value.date_of_birth)).format('YYYY')) : 0,
                        }}
                        rating
                        ratingUserInfo={ratingUserInfo}
                        onRatingClick={onRatingClickHandler}
                    />
                ))}
            </div>
            {showError && (
                <div className={"text-red-700 text-base font-bold mt-2"}>Please give rating to all freelancers.</div>
            )}
            <div className={'flex justify-end mt-4'}>
                <Button type={"button"} onClick={handleSubmitReview}>Submit review</Button>
            </div>
        </>
    );
};

export default ReviewClient;
