import React, {useEffect, useMemo, useRef, useState} from 'react';
import useAuthRequest from "@/lib/useAuthRequest";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import {useToast} from "@/components/ui/use-toast";
import {saveSkill} from "@/redux/reducers/skillReducers";
import {getAllSkills} from "@/redux/actions/skillActions";
import {
    getAllJobs,
    getAllServiceProviders,
    getAllServiceProvidersWithAvailability,
    getClientsJobs,
    setSelectedEvent
} from "@/redux/actions";
import {axios} from "@/lib/axiosInstance";
import CommonDialogComponent from "@/components/common/common-dialog.component";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import {IconsComponent} from "@/components/common/icons.component";
import MultiSelectCommon from "@/components/common/common-multiselect.component";
import AddSkillsModalComponent from "@/components/modals/add-skills-modal.component";
import ControlDateSelectorComponent from "@/components/forms/control-date-selector.component";
import {DialogClose, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {IEvent} from "@/interfaces/event.interfaces";
import { IProject } from "@/interfaces/project.interfaces";
import {useSession} from "next-auth/react";
import {Controller, useForm} from "react-hook-form";
import moment from "moment";
import VStackComponent from "@/components/common/vertical-stack.component";
import {Label} from "@/components/ui/label";
import {format, formatTimeArrayForInput, formatTimeArrayToString} from "@/util/common";
import {Badge} from "@/components/ui/badge";
import ListPotentialProvidersComponent from "@/app/(protected)/dashboard/components/list-potential-providers.component";
import SelectPotentialServiceProvidersComponent
    from "@/app/(protected)/dashboard/components/select-potential-service-providers.component";
import {isEmpty} from "lodash";
import {yupResolver} from "@hookform/resolvers/yup";
import {EventFormSchema} from "@/app/(protected)/dashboard/validation/event-form.schema";
import DeleteInvoiceComponent from "@/app/(protected)/invoices/components/delete-invoice.component";
import {RiDeleteBin6Line} from "react-icons/ri";
import ListAllProvidersComponent from "@/app/(protected)/dashboard/components/list-all-providers.component";
import CommonSelectComponent from "@/components/common/common-select.component";
import { fetchProjects } from "@/services/projects.service";
import { saveProjects } from "@/redux/reducers/eventReducers";
import { appLogger } from "@/lib/logger";

type componentPropType = {
    selectEvent: IEvent;
    index: number;
    serviceProviderLoading?: boolean
    setServiceProviderLoading?: any
    loadSkills: boolean
    skillSet: { value: number, label: string }[]
    isSelected?: boolean
    eventInfoPendingText?: () => string
    requestOpen?: boolean
    onRequestOpenHandled?: () => void
}

const ViewEventModalComponent = ({selectEvent, index, serviceProviderLoading, setServiceProviderLoading, skillSet, loadSkills, isSelected, eventInfoPendingText, requestOpen, onRequestOpenHandled}: componentPropType) => {
    useAuthRequest()
    const dispatch = useAppDispatch()
    const {toast} = useToast()
    const {data: session} = useSession()
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const buttomRef = useRef<HTMLButtonElement | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
    const [numberOfPersons, setNumberOfPersons] = useState<number>(0);
    const [otherSkills, setOtherSkills] = useState<{ value: number, label: string }[]>([]);
    const [eventTimeline, setEventTimeline] = useState<{ end_date: string, start_date: string }>({
        end_date: '',
        start_date: ''
    })
    const [projectsLoading, setProjectsLoading] = useState<boolean>(false);
    const projects = useAppSelector(state => state.events.projects);
    const {serviceProviders} = useAppSelector(state => state.user)
    const {selectedEvent} = useAppSelector(state => state.events)

    const bgColor = useMemo(() => selectEvent?.status === 'WAITING' ? 'bg-yellow-600' : selectEvent?.status === 'STARTED' ? 'bg-green-900' : selectEvent?.status === 'ACCEPTED' ? 'bg-blue-900' : selectEvent?.status === 'COMPLETED' ? '' : 'bg-red-900', [selectEvent]);

    const handleDialogOpenChange = (nextOpen: boolean) => {
        setDialogOpen(nextOpen);
        if (nextOpen) {
            setSelectedEvent(selectEvent);
        }
    };

    const handleManualMessage = async () => {
        if (!selectEvent?.id || isSendingMessage) {
            return;
        }

        setIsSendingMessage(true);

        try {
            const response = await axios.get(`/job/manual-sms/${selectEvent.id}`);
            const success = response?.data?.Success ?? response?.data?.success ?? response?.data ?? false;

            if (success === true) {
                toast({ description: 'Bericht verzonden.' });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Verzenden mislukt',
                    description: 'Het versturen van het bericht is niet gelukt. Probeer het later opnieuw.'
                });
            }
        } catch (error: any) {
            appLogger.error('Failed to send manual message', error);
            toast({
                variant: 'destructive',
                title: 'Verzenden mislukt',
                description: error?.response?.data?.message ?? 'Er is iets misgegaan tijdens het verzenden.'
            });
        } finally {
            setIsSendingMessage(false);
        }
    };

    useEffect(() => {
        if ((projects?.length ?? 0) > 0) {
            return;
        }

        let cancelled = false;

        const loadProjects = async () => {
            setProjectsLoading(true);
            try {
                const response = await fetchProjects();
                if (!cancelled) {
                    dispatch(saveProjects(Array.isArray(response) ? response : []));
                }
            } catch (error: any) {
                if (!cancelled) {
                    appLogger.error('Failed to load projects', error);
                    toast({
                        variant: "destructive",
                        title: "Projecten konden niet worden geladen",
                        description: error?.response?.data?.message ?? "Probeer het later opnieuw."
                    });
                }
            } finally {
                if (!cancelled) {
                    setProjectsLoading(false);
                }
            }
        };

        loadProjects();

        return () => {
            cancelled = true;
        };
    }, [dispatch, projects, toast]);

    useEffect(() => {
        setNumberOfPersons(selectEvent ? Number(selectEvent.number_of_people) : 0)
        setOtherSkills(selectEvent ? selectEvent.job_other_skills.map((value, key) => ({ value: key, label: value })) : [])
    }, [selectEvent]);

    useEffect(() => {
        if (requestOpen) {
            setSelectedEvent(selectEvent);
            setDialogOpen(true);
            onRequestOpenHandled?.();
        }
    }, [requestOpen, selectEvent, onRequestOpenHandled]);

    useEffect(() => {
        if (!isEmpty(eventTimeline.start_date) && !isEmpty(eventTimeline.end_date)) {
            getAllServiceProvidersWithAvailability(eventTimeline.start_date, eventTimeline.end_date, setServiceProviderLoading).then(null)
        }
    }, [eventTimeline, setServiceProviderLoading])

    const {
        handleSubmit,
        control,
        getValues,
        setError,
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
            project_id: selectEvent ? selectEvent.project?.id : undefined,
            number_of_people: selectEvent ? selectEvent.number_of_people : '',
            job_other_skills: selectEvent ? selectEvent.job_other_skills.filter(skill => !isEmpty(skill)) : [],
            required_skills: selectEvent ? selectEvent.required_skills.map(skill => skill.id) : '',
            potential_service_providers: selectEvent ? selectEvent.potential_service_providers.map(service_providers => service_providers.service_provider_id) : '',
            start_date: selectEvent ? moment(selectEvent.start_date.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD') : '',
            end_date: selectEvent ? moment(selectEvent.end_date.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD') : '',
        },
    })

    useEffect(() => {
        setValue('potential_service_providers', selectedEvent ? selectedEvent.potential_service_providers.map(service_providers => service_providers.service_provider_id) : '')
    }, [serviceProviders, selectedEvent, setValue]);

    useEffect(() => {
        setValue('project_id', selectedEvent?.project?.id ?? undefined);
    }, [selectedEvent, setValue]);

    if (!session) return <></>

    const onSubmit = async (data: any) => {
        const {
            potential_service_providers: potentialServiceProvidersField,
            required_skills: requiredSkillsField,
            project_id,
            ...restData
        } = data;

        const potentialProviders = Array.isArray(potentialServiceProvidersField) ? potentialServiceProvidersField : [];
        const requiredSkills = Array.isArray(requiredSkillsField) ? requiredSkillsField : [];

        const client = restData.client ? {id: restData.client} : undefined
        const { reviewed_by_client, reviewed_by_service_provider, ...eventWithoutReviews } = selectEvent;
        const selectedProject = project_id ? projects.find(project => project.id === Number(project_id)) : undefined;

        const createEventRes = await axios.post('/job/updateJob', {
            //...selectEvent,
            ...eventWithoutReviews,
            ...restData,
            client: client,
            status: selectEvent.status,
            created_by: {id: selectEvent.created_by?.id},
            service_providers_list: selectEvent.service_providers_list.map(value => ({id: value.id})),
            required_skills: requiredSkills.map((skills: number) => ({id: skills})),
            potential_service_providers: potentialProviders.map((service_providers: number) => ({service_provider_id: service_providers})),
            ...(selectedProject ? { project: { id: selectedProject.id, name: selectedProject.name, description: selectedProject.description ?? '' } } : { project: null })

        })
        if (createEventRes.data.error || createEventRes.data === 'error in api execution') {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: createEventRes.data.error,
            })
            setIsLoading(false)
        } else {
            toast({
                description: "You have successfully created an event.",
            })
            buttomRef.current?.click()
            const {user} = session
            if (user.depId === 1) {
                getClientsJobs(`${user.id}`).then(null)
            } else {
                getAllJobs().then(null)
            }
            setIsLoading(false)
        }
    }

    return (
        <CommonDialogComponent
            triggerLabel={'Event'}
            dialogTitle={'Event'}
            triggerClassName={"w-full"}
            contentClassName={'w-[90%] md:max-w-[85%] !overflow-hidden'}
            open={dialogOpen}
            onOpenChange={handleDialogOpenChange}
            customTitle={
            <HStackComponent className={`pr-5`}>
                <HStackComponent className={'justify-start w-full gap-2 flex !flex-row'}>
                    <DialogTitle>Event</DialogTitle>
                    <Badge variant={"default"} className={bgColor}>{selectEvent?.status?.replace('_', ' ')}</Badge>
                </HStackComponent>
                {session.user.depId === 2 && (
                    <HStackComponent className='gap-2'>
                        {selectEvent?.status === 'COMPLETED' && (
                            <Button
                                variant='outline'
                                className='gap-2'
                                onClick={handleManualMessage}
                                disabled={isSendingMessage}
                            >
                                {isSendingMessage ? (
                                    <IconsComponent.spinner className='h-4 w-4 animate-spin' />
                                ) : null}
                                <span>{isSendingMessage ? 'Verzenden...' : 'Stuur bericht'}</span>
                            </Button>
                        )}
                        <DeleteInvoiceComponent
                            afterDelete={() => {
                                const {user} = session;
                                if (user.depId === 1) {
                                    getClientsJobs(`${user.id}`).then(null);
                                } else {
                                    getAllJobs().then(null);
                                }
                                buttomRef.current?.click();
                            }}
                            selectedEvent={selectEvent}
                            customTrigger={(
                                <Button variant='outline' className='gap-2'>
                                    <RiDeleteBin6Line className='text-red-700' />
                                    <p className='text-red-700'>Delete</p>
                                </Button>
                            )}
                        />
                    </HStackComponent>
                )}
            </HStackComponent>
            }
            customTrigger={
                <Button onClick={() => setSelectedEvent(selectEvent)} variant={'outline'}
                        className={`flex items-start justify-start flex-col hover:bg-[#00000047] h-auto w-full ${isSelected ? 'border-green-700 border' : ''}`}>
                    <div className={"flex justify-between w-full gap-2"}>
                        <p className={'capitalize break-all whitespace-normal text-start font-bold'}>{selectEvent.title}</p>
                    </div>
                    <div className={"flex justify-between items-center w-full"}>
                        <p className={"w-fit overflow-hidden text-left"}>({moment(selectEvent.start_date.join('-'), 'YYYY-MM-DD').format('DD/MM')} - {moment(selectEvent.end_date.join('-'), 'YYYY-MM-DD').format('DD/MM')})</p>
                        <p className={"w-44 overflow-hidden text-right text-ellipsis"}>{eventInfoPendingText && eventInfoPendingText()}</p>
                    </div>
                </Button>
            }
            dialogBody={
                <HStackComponent className={'items-start'}>
                    <form className={"flex flex-col gap-4 w-full max-h-[80vh] px-2 overflow-auto !mt-4"}>
                        <ControllerInputComponent
                            disabled={session.user.depId === 3}
                            placeholder='Enter your title here...'
                            errors={errors}
                            control={control} inputName={'title'}
                            labelName={'Title'}/>
                        <HStackComponent className={'items-start'}>
                            <ControllerInputComponent
                                disabled={session.user.depId === 3}
                                onChangeHandler={e => {
                                    setNumberOfPersons(Number(e.target.value))
                                        setError('potential_service_providers', {
                                            type: "manual",
                                            message: undefined
                                        })
                                }} placeholder='Enter your number of people required here...'
                                errors={errors}
                                type={'number'}
                                control={control} inputName={'number_of_people'}
                                labelName={'Number of people'}/>
                            <ControllerInputComponent
                                disabled={session.user.depId === 3}
                                placeholder='Enter your role here...'
                                errors={errors}
                                control={control} inputName={'role'}
                                labelName={'role'}/>
                            {session.user.depId === 2 && <ControllerInputComponent
                                placeholder='Enter the invoice number here...'
                                errors={errors}
                                control={control} inputName={'invoice'}
                                labelName={'invoice'}/>}
                        </HStackComponent>
                        <HStackComponent className={'items-start'}>
                            <ControllerInputComponent
                                disabled={session.user.depId === 3}
                                placeholder='Enter project lead name here...'
                                errors={errors}
                                control={control} inputName={'project_lead_name'}
                                labelName={'Project lead name'}/>
                            <ControllerInputComponent
                                disabled={session.user.depId === 3}
                                placeholder='Enter project lead number here...'
                                errors={errors}
                                doNotUseFieldOnChange
                                onChangeHandler={(e) => {
                                    const regex = /^[0-9]+$/;
                                    if (regex.test(e.target.value.replaceAll('+' , '')) || isEmpty(e.target.value.replaceAll('+' , ''))) {
                                        setValue('project_lead_number', isEmpty(e.target.value.replaceAll('+' , '')) ? '' : `+${e.target.value.replaceAll('+' , '')}`)
                                    }
                                }}
                                control={control} inputName={'project_lead_number'}
                                labelName={'Project lead number'}/>
                            <VStackComponent className={'items-start'}>
                                <Label htmlFor={'project_id'} className="text-left">
                                    Project
                                </Label>
                                <HStackComponent className={'gap-2'}>
                                    <Controller
                                        name={'project_id'}
                                        control={control}
                                        render={({field}) => (
                                            <CommonSelectComponent
                                                placeholder={'Select project'}
                                                selectedValue={field.value ?? ''}
                                                selectOption={(projects ?? []).map(project => ({ value: project.id, label: project.name }))}
                                                onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                                                disabled={(projects ?? []).length === 0}
                                            />
                                        )}
                                    />
                                    {projectsLoading && (
                                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                </HStackComponent>
                            </VStackComponent>
                        </HStackComponent>
                        <VStackComponent className={'items-start'}>
                            <SelectPotentialServiceProvidersComponent serviceProviderLoading={serviceProviderLoading || false} numberOfPersons={numberOfPersons} control={control} setError={setError}/>
                            {errors['potential_service_providers'] && errors['potential_service_providers']?.message &&
                                <span className={"text-errorText text-sm font-bold"}>{errors['potential_service_providers']?.message as never}</span>
                            }
                        </VStackComponent>
                        <HStackComponent className={'items-start'}>
                            <ControllerInputComponent
                                disabled={session.user.depId === 3}
                                placeholder='Enter shift start time here (00:00 AM)...'
                                errors={errors}
                                type={'time'}
                                control={control} inputName={'start_time'}
                                labelName={'Shift start time'}/>
                            <ControllerInputComponent
                                disabled={session.user.depId === 3}
                                placeholder='Enter shift end time here (00:00 AM)...'
                                errors={errors}
                                type={'time'}
                                control={control} inputName={'end_time'}
                                labelName={'Shift end time'}/>
                        </HStackComponent>
                        <ControllerTextareaComponent
                            disabled={session.user.depId === 3}
                            placeholder='Enter the description here...'
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
                                            <MultiSelectCommon
                                                disabled={session.user.depId === 3}
                                                placeholder={'Select required skills.'}
                                                onChange={(e) => {
                                                    const fieldValue = e.map(value => value.value)
                                                    field.onChange(fieldValue)
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
                                {/*<AddSkillsModalComponent setSkillSet={setSkillSet}/>*/}
                            </HStackComponent>
                            {errors['required_skills'] && errors['required_skills']?.message &&
                                <span className={"text-errorText text-sm font-bold"}>
                            {errors['required_skills']?.message as never}
                        </span>
                            }
                        </VStackComponent>
                        <VStackComponent className={'items-start'}>
                            <Label htmlFor={'Skills'} className="text-left">
                                Other Skills
                            </Label>
                            <HStackComponent>
                                <Controller
                                    name={'job_other_skills'}
                                    control={control}
                                    render={({field}) => (
                                        <HStackComponent className={'gap-2 '}>
                                            <MultiSelectCommon placeholder={'Select required skills.'}
                                                               onChange={(e) => {
                                                                   const fieldValue = e.map(value => value.label)
                                                                   field.onChange(fieldValue)
                                                               }}
                                                               selectedValue={field.value ? otherSkills.filter(clients => field.value.includes(clients.label)).map(value => ({
                                                                   value: `${value.value}`,
                                                                   label: value.label
                                                               })) : []}
                                                               selectOption={otherSkills.map(value => ({
                                                                   value: `${value.value}`,
                                                                   label: value.label
                                                               }))}/>
                                            {loadSkills && (
                                                <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                                            )}
                                        </HStackComponent>
                                    )}
                                />
                                <AddSkillsModalComponent otherSkill setSkillSet={setOtherSkills}/>
                            </HStackComponent>
                            {errors['job_other_skills'] && errors['job_other_skills']?.message &&
                                <span className={"text-errorText text-sm font-bold"}>
                            {errors['job_other_skills']?.message as never}
                        </span>
                            }
                        </VStackComponent>
                        <ControllerTextareaComponent
                            disabled={session.user.depId === 3}
                            placeholder='Enter the destination here...'
                            errors={errors} control={control} inputName={'destination'}
                            labelName={'Destination'}/>
                        <HStackComponent className={'items-start'}>
                            <ControlDateSelectorComponent
                                disabled={session.user.depId === 3}
                                onChange={(e) => {
                                    setEventTimeline(prevState => ({
                                        ...prevState,
                                        start_date: e,
                                        end_date: moment(e, 'YYYY-MM-DD').format('YYYY-MM-DD')
                                    }))
                                    setValue('end_date', moment(e, 'YYYY-MM-DD').format('YYYY-MM-DD'))
                                }}
                                placeholder='Pick start date...'
                                errors={errors} control={control} inputName={'start_date'}
                                labelName={'Start date'}/>
                            <ControlDateSelectorComponent
                                disabled={session.user.depId === 3}
                                onChange={(e) => setEventTimeline(prevState => ({...prevState, end_date: e}))}
                                placeholder='Pick end date...'
                                errors={errors} control={control} inputName={'end_date'}
                                labelName={'End date'}/>
                        </HStackComponent>
                        {session.user.depId !== 3 && (
                            <HStackComponent className={'w-full justify-end my-2 mb-4 flex !flex-row'}>
                                <DialogClose asChild>
                                    <Button ref={buttomRef} type="button" variant="secondary">
                                        Dichtbij
                                    </Button>
                                </DialogClose>
                                <Button type={'button'}
                                        disabled={isLoading}
                                        className={'w-4/12'}
                                        onClick={handleSubmit(onSubmit)}>
                                    {isLoading && (
                                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                                    )}
                                    Update event
                                </Button>
                            </HStackComponent>
                        )}
                    </form>
                    {session.user.depId !== 3 && (
                        <>
                            <div className={'bg-gray-200 rounded w-[2px] h-full'}/>
                            {session.user.depId === 2 ?
                                <ListAllProvidersComponent serviceProviderLoading={serviceProviderLoading ?? false} selectedProviders={selectEvent ? selectEvent.potential_service_providers : []}/>
                                : <ListPotentialProvidersComponent serviceProviderLoading={serviceProviderLoading ?? false} selectedProviders={selectEvent ? selectEvent.potential_service_providers : []}/>}
                        </>
                    )}
                </HStackComponent>
            }
        />
    );
};

export default ViewEventModalComponent;
