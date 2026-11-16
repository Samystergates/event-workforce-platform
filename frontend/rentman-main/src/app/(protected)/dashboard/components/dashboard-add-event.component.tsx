"use client"
import React, {useEffect, useMemo, useRef, useState} from 'react';
import HStackComponent from "@/components/common/horizontal-stack.component";
import CommonDialogComponent from "@/components/common/common-dialog.component";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import {Button} from "@/components/ui/button";
import {DialogClose} from "@/components/ui/dialog";
import {Controller, useForm} from "react-hook-form";
import moment from "moment";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import AddSkillsModalComponent from "@/components/modals/add-skills-modal.component";
import ControlDateSelectorComponent from "@/components/forms/control-date-selector.component";
import {axios} from "@/lib/axiosInstance";
import {isEmpty} from "lodash";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import {saveSkill} from "@/redux/reducers/skillReducers";
import useAuthRequest from "@/lib/useAuthRequest";
import {useToast} from "@/components/ui/use-toast";
import {IconsComponent} from "@/components/common/icons.component";
import {useSession} from "next-auth/react";
import {getAllSkills} from "@/redux/actions/skillActions";
import {
    getAllClient, getAllJobs,
    getAllServiceProviders, getAllServiceProvidersAnyStatus,
    getAllServiceProvidersWithAvailability,
    getClientsJobs,
    getModeratorJobs,
    getServiceProvidersJobs
} from "@/redux/actions";
import MultiSelectCommon from "@/components/common/common-multiselect.component";
import VStackComponent from "@/components/common/vertical-stack.component";
import SelectPotentialServiceProvidersComponent
    from "@/app/(protected)/dashboard/components/select-potential-service-providers.component";
import ListPotentialProvidersComponent from "@/app/(protected)/dashboard/components/list-potential-providers.component";
import {Label} from "@/components/ui/label";
import {EventFormSchema} from "@/app/(protected)/dashboard/validation/event-form.schema";
import {yupResolver} from "@hookform/resolvers/yup";
import { CiSquareInfo } from "react-icons/ci";
import CommonSelectComponent from "@/components/common/common-select.component";
import ListAllProvidersComponent from "@/app/(protected)/dashboard/components/list-all-providers.component";
import { fetchProjects } from "@/services/projects.service";
import { saveProjects } from "@/redux/reducers/eventReducers";
import { appLogger } from "@/lib/logger";

const DashboardAddEventComponent = () => {
    useAuthRequest()
    const dispatch = useAppDispatch()
    const {toast} = useToast()
    const {data: session} = useSession()
    const [eventTimeline, setEventTimeline] = useState<{ end_date: string, start_date: string }>({
        end_date: '',
        start_date: ''
    })
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const buttomRef = useRef<HTMLButtonElement | null>(null);
    const [otherSkills, setOtherSkills] = useState<{ value: number, label: string }[]>([]);
    const [skillSet, setSkillSet] = useState<{ value: number, label: string }[]>([]);
    const [loadSkills, setLoadSkills] = useState<boolean>(false);
    const [serviceProviderLoading, setServiceProviderLoading] = useState<boolean>(false);
    const [projectsLoading, setProjectsLoading] = useState<boolean>(false);
    const projects = useAppSelector(state => state.events.projects);
    const [numberOfPersons, setNumberOfPersons] = useState<number>(0);
    const [clientLoading, setClientLoading] = useState<boolean>(false);
    const {allClients} = useAppSelector(state => state.user)

    useEffect(() => {
        dispatch(saveSkill(skillSet.map(value => ({id: value.value, name: value.label}))))
    }, [dispatch, skillSet]);

    useEffect(() => {
        getAllSkills(setLoadSkills, setSkillSet).then(null)
        getAllClient(setClientLoading).then(null)
    }, []);

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

    const projectOptions = useMemo(() => (projects ?? []).map(project => ({ value: project.id, label: project.name })), [projects]);

    useEffect(() => {
        if (!isEmpty(eventTimeline.start_date) && !isEmpty(eventTimeline.end_date)) {
            if (session?.user?.depId === 2) {
                getAllServiceProvidersAnyStatus(eventTimeline.start_date, eventTimeline.end_date, setServiceProviderLoading).then(null)
            } else {
                getAllServiceProvidersWithAvailability(eventTimeline.start_date, eventTimeline.end_date, setServiceProviderLoading).then(null)
            }
        }
    }, [eventTimeline, session?.user?.depId])

    const {
        handleSubmit,
        control,
        getValues,
        setError,
        setValue,
        reset,
        formState: {errors},
    } = useForm<any>({
        resolver: yupResolver(EventFormSchema()),
        defaultValues: {
            active: true,
            title: '',
            destination: '',
            role: '',
            description: '',
            created_by: undefined,
            required_skills: undefined,
            job_other_skills: undefined,
            project_lead_name: '',
            project_lead_number: "",
            project_id: undefined,
            start_time: "",
            end_time: "",
            moderator_approval: 0,
            number_of_people: "",
            potential_service_providers: undefined,
            creation_date: moment().format('YYYY-MM-DD'),
            start_date: undefined,
            end_date: undefined,
        },
    })

    if (!session) return <></>

    const onSubmit = async (data: any) => {
        const {
            required_skills: requiredSkillsField,
            job_other_skills: jobOtherSkillsField,
            potential_service_providers: potentialServiceProvidersField,
            project_id,
            ...restData
        } = data;

        const client = session.user.depId === 1 ? {id: session?.user?.id} : {id: Number(data.client)}
        const selectedProject = project_id ? projects.find(project => project.id === Number(project_id)) : undefined;

        const createEventRes = await axios.post('/job/createJob', {
            ...restData,
            client: client,
            status: "ACCEPTED",
            created_by: {id: session?.user?.id},
            required_skills: requiredSkillsField ? requiredSkillsField.map((skills: number) => ({id: skills})) : [],
            job_other_skills: jobOtherSkillsField ? jobOtherSkillsField.map((skills: number) => skills).filter((skill: any) => !isEmpty(skill)) : [],
            potential_service_providers: (potentialServiceProvidersField ?? []).map((service_providers: number) => ({service_provider_id: service_providers})),
            ...(selectedProject ? { project: { id: selectedProject.id, name: selectedProject.name, description: selectedProject.description ?? '' } } : {})
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
            reset()
            if (session) {
                const {user} = session
                if (user.depId === 1) {
                    getClientsJobs(`${user.id}`).then(null)
                } else if (user.depId === 2) {
                    getAllJobs().then(null)
                } else {
                    getServiceProvidersJobs(`${user.id}`).then(null)
                }
            }
            setIsLoading(false)
        }
    }

    return (
        <CommonDialogComponent
            triggerLabel={'Create event'}
            triggerClassName={'min-w-[7em]'}
            dialogTitle={'Create event'}
            contentClassName={'max-w-[95%]'}
            dialogBody={
                <div>
                    <HStackComponent className={'p-2 rounded bg-yellow-400 gap-1 flex !flex-row justify-start'}><CiSquareInfo className={'w-5 h-5'}/><p className={"text-sm md:text-base"}>Select event dates to get freelancers</p></HStackComponent>
                    <HStackComponent className={'items-start h-[95%] mt-6 md:mt-0'}>
                        <form className={"flex flex-col gap-4 !mt-4 w-full"}>
                            <HStackComponent className={'items-start'}>
                                <ControlDateSelectorComponent
                                    onChange={(e) => {
                                        setEventTimeline(prevState => ({
                                            ...prevState,
                                            start_date: e,
                                            end_date: moment(e, 'YYYY-MM-DD').format('YYYY-MM-DD')
                                        }))
                                        setValue('end_date', moment(e, 'YYYY-MM-DD').format('YYYY-MM-DD'))
                                    }}
                                    placeholder='Kies startdatum...'
                                    errors={errors} control={control} inputName={'start_date'}
                                    labelName={'Start date'}/>
                                <ControlDateSelectorComponent
                                    onChange={(e) => setEventTimeline(prevState => ({...prevState, end_date: e}))}
                                    placeholder='Einddatum kiezen...'
                                    errors={errors} control={control} inputName={'end_date'}
                                    labelName={'End date'}/>
                            </HStackComponent>
                            <HStackComponent>
                                <ControllerInputComponent placeholder='Vul hier uw titel in...'
                                                          errors={errors}
                                                          control={control} inputName={'title'}
                                                          labelName={'Title'}/>
                                {session.user.depId === 2 && (
                                    <VStackComponent className={'items-start'}>
                                        <Label htmlFor={'Skills'} className="text-left">
                                            Selecteer klant
                                        </Label>
                                        <HStackComponent className={'gap-2'}>
                                            <Controller
                                                name={'client'}
                                                control={control}
                                                render={({field}) => (
                                                    <CommonSelectComponent
                                                        placeholder={'Selecteer klant voor evenement'}
                                                        onChange={(e) => {
                                                            field.onChange(Number(e));
                                                        }}
                                                        selectedValue={field.value}
                                                        selectOption={allClients.map(client => ({
                                                            value: `${client.id}`,
                                                            label: `${client.first_name ?? ''} ${client.last_name ?? ''}`
                                                        }))}
                                                    />
                                                )}
                                            />
                                            {clientLoading && (
                                                <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                                            )}
                                        </HStackComponent>
                                    </VStackComponent>
                                )}
                            </HStackComponent>
                            <HStackComponent className={'items-start'}>
                                <ControllerInputComponent onChangeHandler={e => {
                                    setNumberOfPersons(Number(e.target.value))
                                    // if (Number(e.target.value) !== (getValues('potential_service_providers') ?? [])?.length) {
                                    //     setError(`potential_service_providers`, {
                                    //         type: "manual",
                                    //         message: Number(e.target.value) > (getValues('potential_service_providers') ?? [])?.length ? `Selecteer alstublieft ${Number(e.target.value) - (getValues('potential_service_providers') ?? [])?.length} potentiële freelancer.` : `Verwijder alstublieft ${(getValues('potential_service_providers') ?? [])?.length - Number(e.target.value)} potentiële freelancer.`,
                                    //     })
                                    // } else {
                                        setError(`potential_service_providers`, {
                                            type: "manual",
                                            message: undefined,
                                        })
                                    // }
                                }} placeholder='Vul hier het gewenste aantal personen in...'
                                                          errors={errors}
                                                          type={'number'}
                                                          control={control} inputName={'number_of_people'}
                                                          labelName={'Number of people'}/>
                                <ControllerInputComponent placeholder='Vul hier uw rol in...'
                                                          errors={errors}
                                                          control={control} inputName={'role'}
                                                          labelName={'role'}/>
                                {session.user.depId === 2 && <ControllerInputComponent
                                    placeholder='Vul hier het factuurnummer in...'
                                    errors={errors}
                                    control={control} inputName={'invoice'}
                                    labelName={'invoice'}/>}
                            </HStackComponent>
                            <HStackComponent className={'items-start'}>
                                <ControllerInputComponent placeholder='Voer hier de naam van de projectleider in...'
                                                          errors={errors}
                                                          control={control} inputName={'project_lead_name'}
                                                          labelName={'Project lead name'}/>
                                <ControllerInputComponent placeholder='Voer hier het projectleidernummer in...'
                                                          errors={errors}
                                                          control={control} inputName={'project_lead_number'}
                                                          doNotUseFieldOnChange
                                                          onChangeHandler={(e) => {
                                                              const regex = /^[0-9]+$/;
                                                              if (regex.test(e.target.value.replaceAll('+', '')) || isEmpty(e.target.value.replaceAll('+', ''))) {
                                                                  setError(`project_lead_number`, {
                                                                      type: "manual",
                                                                      message: undefined,
                                                                  })
                                                                  setValue('project_lead_number', isEmpty(e.target.value.replaceAll('+', '')) ? '' : `+${e.target.value.replaceAll('+', '')}`)
                                                              }
                                                          }}
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
                                                    placeholder={'Selecteer project'}
                                                    selectedValue={field.value ?? ''}
                                                    selectOption={projectOptions}
                                                    onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                                                    disabled={projectOptions.length === 0}
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
                                <SelectPotentialServiceProvidersComponent serviceProviderLoading={serviceProviderLoading} numberOfPersons={numberOfPersons}
                                                                          control={control} setError={setError}/>
                                {errors['potential_service_providers'] && errors['potential_service_providers']?.message &&
                                    <span className={"text-errorText text-sm font-bold"}>
                            {errors['potential_service_providers']?.message as never}
                        </span>
                                }
                            </VStackComponent>
                            <HStackComponent className={'items-start'}>
                                <ControllerInputComponent placeholder='Voer hier de starttijd van de dienst in (00:00 AM)...'
                                                          errors={errors}
                                                          type={'time'}
                                                          control={control} inputName={'start_time'}
                                                          labelName={'Shift start time'}/>
                                <ControllerInputComponent placeholder='Voer hier de eindtijd van de dienst in (00:00 AM)...'
                                                          errors={errors}
                                                          type={'time'}
                                                          control={control} inputName={'end_time'}
                                                          labelName={'Shift end time'}/>
                            </HStackComponent>
                            <ControllerTextareaComponent placeholder='Vul hier de omschrijving in...'
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
                                                <MultiSelectCommon placeholder={'Selecteer de vereiste vaardigheden.'}
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
                                    Andere vaardigheden
                                </Label>
                                <HStackComponent>
                                    <Controller
                                        name={'job_other_skills'}
                                        control={control}
                                        render={({field}) => (
                                            <HStackComponent className={'gap-2'}>
                                                <MultiSelectCommon placeholder={'Selecteer de vereiste vaardigheden.'}
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
                            <ControllerTextareaComponent placeholder='Vul hier de bestemming in...'
                                                         errors={errors} control={control} inputName={'destination'}
                                                         labelName={'Destination'}/>
                            <HStackComponent className={'w-full justify-end my-2 flex !flex-row'}>
                                <DialogClose asChild>
                                    <Button ref={buttomRef} type="button" variant="secondary">
                                        Dichtbij
                                    </Button>
                                </DialogClose>
                                <Button type={'button'} disabled={isLoading} className={'w-4/12'}
                                        onClick={handleSubmit(onSubmit)}>
                                    {isLoading && (
                                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                                    )}
                                    Evenement aanmaken
                                </Button>
                            </HStackComponent>
                        </form>
                        {!isEmpty(eventTimeline.start_date) && !isEmpty(eventTimeline.end_date) && (
                            <>
                                <div className={'bg-gray-200 rounded w-[2px] h-full mt-4 hidden md:block'}/>
                                {session.user.depId === 2 ?
                                    <ListAllProvidersComponent serviceProviderLoading={serviceProviderLoading}/>
                                : <ListPotentialProvidersComponent serviceProviderLoading={serviceProviderLoading}/>}
                            </>
                        )}
                    </HStackComponent>
                </div>
            }
        />
    );
};

export default DashboardAddEventComponent;
