"use client"
import React, { useEffect, useState } from 'react';
import { object, ref, string } from "yup";
import useAuthRequest from "@/lib/useAuthRequest";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useToast } from "@/components/ui/use-toast";
import { saveSkill } from "@/redux/reducers/skillReducers";
import { getAllSkills } from "@/redux/actions/skillActions";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { axios } from "@/lib/axiosInstance";
import { isEmpty, isNull } from "lodash";
import HStackComponent from "@/components/common/horizontal-stack.component";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import { IconsComponent } from "@/components/common/icons.component";
import { Button } from "@/components/ui/button";
import VStackComponent from "@/components/common/vertical-stack.component";
import { Label } from "@/components/ui/label";
import MultiSelectCommon from "@/components/common/common-multiselect.component";
import AddSkillsModalComponent from "@/components/modals/add-skills-modal.component";
import { getSelectedServiceProviders } from "@/redux/actions";
import CommonSelectComponent from "@/components/common/common-select.component";
import { CalendarDateRangePicker } from "@/components/common/date-range-picker";
import ProfilePhotoComponent from "@/components/common/profile-photo.component";
import { addDays } from "date-fns";
import moment from "moment";
import { TbExternalLink } from "react-icons/tb";
import { getDatesBetween } from "@/util/common";

const userAuthSchema = object({
    email: string().email('Ongeldig e-mailadres.').required('Dit veld is verplicht.'),
    password: string(),
    confirmPassword: string().oneOf([ref('password')], 'Passwords must match'),
    first_name: string().required('Dit veld is verplicht.'),
    about: string().required('Dit veld is verplicht.'),
});


const CommonServiceProviderViewComponent = ({ userId, disabled }: { userId: string; disabled?: boolean }) => {
    useAuthRequest()
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const endOfMonth = new Date();
    endOfMonth.setDate(31);
    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch()
    const [skillSet, setSkillSet] = useState<{ value: number, label: string }[]>([]);
    const [loadSkills, setLoadSkills] = useState<boolean>(false);
    const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
    const { selectedServiceProviders } = useAppSelector(state => state.skills)
    const [isCustom, setIsCustom] = useState<boolean>(false)
    const { toast } = useToast()

    useEffect(() => {
        dispatch(saveSkill(skillSet.map(value => ({ id: value.value, name: value.label }))))
    }, [dispatch, skillSet]);

    useEffect(() => {
        const fetchSkills = async () => {
            await getAllSkills(setLoadSkills, setSkillSet)
        }

        fetchSkills().then(null)
    }, []);

    useEffect(() => {
        const fetchSkills = async () => {
            await getSelectedServiceProviders(setLoadingProfile, userId)
        }

        fetchSkills().then(null)
    }, [userId]);

    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<any>({
        resolver: yupResolver(userAuthSchema),
        defaultValues: {
            first_name: selectedServiceProviders?.first_name ?? '',
            last_name: selectedServiceProviders?.last_name ?? '',
            email: selectedServiceProviders?.email ?? '',
            pin: selectedServiceProviders?.pin ?? '',
            password: '',
            confirmPassword: '',
            about: selectedServiceProviders?.about ?? '',
            depId: '3',
            active: true,
            availabilityStatus: true,
            rating: selectedServiceProviders?.rating ?? 0,
            contact: selectedServiceProviders?.contact ?? '',
            discussed_rate: selectedServiceProviders?.discussed_rate ?? '',
            skills: selectedServiceProviders?.skills.map(value => value.id) ?? '',
            availabilityRange: selectedServiceProviders?.availability_options ?? '',
            profilePhoto: selectedServiceProviders?.profile_image ? `${process.env.NEXT_PUBLIC_URL}/user/getUserProfileImage/${selectedServiceProviders?.profile_image}` : undefined
        },
    })

    useEffect(() => {
        setValue('first_name', selectedServiceProviders?.first_name ?? '')
        setValue('last_name', selectedServiceProviders?.last_name ?? '')
        setValue('email', selectedServiceProviders?.email ?? '')
        setValue('pin', selectedServiceProviders?.pin ?? '')
        setValue('discussed_rate', selectedServiceProviders?.discussed_rate ?? '')
        setValue('about', selectedServiceProviders?.about ?? '')
        setValue('rating', selectedServiceProviders?.rating ?? 0)
        setValue('contact', selectedServiceProviders?.contact ?? '')
        setValue('availabilityRange', selectedServiceProviders?.availability_options ?? '')
        setValue('skills', selectedServiceProviders?.skills.map(value => value.id) ?? '')
        setValue('profilePhoto', selectedServiceProviders?.profile_image ? `${process.env.NEXT_PUBLIC_URL}/user/getUserProfileImage/${selectedServiceProviders?.profile_image}` : undefined)
        setStartDate(selectedServiceProviders?.availability_dates
            ? new Date(selectedServiceProviders?.availability_dates[0] ?? '')
            : new Date())
        setEndDate(selectedServiceProviders?.availability_dates
            ? new Date(selectedServiceProviders?.availability_dates[0] ?? '')
            : new Date())
    }, [selectedServiceProviders, setValue]);

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        setError(null)
        const commonValues = {
            password: isEmpty(data.password) ? undefined : data.password,
            about: data.about,
        }

        const serviceProvidersValues = {
            ...commonValues,
            first_name: data.first_name,
            last_name: data.last_name,
            id: selectedServiceProviders?.id,
            availabilityStatus: data.availabilityStatus,
            availability_dates: [...new Set([...(selectedServiceProviders?.availability_dates || []), ...getDatesBetween(new Date(moment(startDate).format('YYYY-MM-DD')), new Date(moment(endDate).format('YYYY-MM-DD')))])],
            availability_options: data.availabilityRange,
            contact: data.contact,
            discussed_rate: data.discussed_rate,
            pin: data.pin,
            skills: data.skills?.map((skill: number) => ({ id: Number(skill) }))
        }

        const signupData = await axios.post('/user/updateServiceProvider', serviceProvidersValues)
        if (signupData.data.error) {
            setError(signupData.data.error)
            setIsLoading(false)
        } else {
            const formData = new FormData();
            formData.append('userId', signupData.data.id)
            formData.append('profile_image', data.profilePhoto)

            await axios.post('/user/updateUserProfileImage', formData)
            toast({
                description: "Profile updated successfully",
            })
            setIsLoading(false)
        }
    }

    if (loadingProfile) {
        return (
            <HStackComponent className={'h-[50vh] w-full gap-1'}>
                <p>Laden</p> <IconsComponent.spinner className="h-4 w-4 animate-spin" />
            </HStackComponent>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={"flex flex-col gap-4"}>
            {!isNull(error) && (
                <div className={'bg-red-100 text-red-300 rounded-md text-sm px-4 py-2'}>
                    {error}
                </div>
            )}
            <HStackComponent className={'gap-6'}>
                <Controller
                    name={'profilePhoto'}
                    control={control}
                    render={({ field }) => (
                        <ProfilePhotoComponent
                            image={field.value}
                            disabled={disabled}
                            onChangeHandler={(e) => {
                                if (e.target.files) {
                                    field.onChange(e.target.files[0])
                                }
                            }} />
                    )}
                />
                <VStackComponent>
                    <HStackComponent className={'items-start'}>
                        <ControllerInputComponent placeholder='Vul hier uw voornaam in...' errors={errors}
                            control={control} inputName={'first_name'}
                            labelName={'Voornaam'} />
                        <ControllerInputComponent placeholder='Vul hier uw achternaam in...' errors={errors}
                            control={control} inputName={'last_name'}
                            labelName={'Achternaam'} />
                    </HStackComponent>
                    <HStackComponent className={'items-start'}>
                        <ControllerInputComponent disabled placeholder='Vul hier uw e-mailadres in...' errors={errors}
                            control={control} inputName={'email'}
                            labelName={'Email'} />
                        <ControllerInputComponent disabled placeholder='Vul hier uw pin in...' errors={errors}
                            control={control} inputName={'pin'}
                            labelName={'Pin'} />
                    </HStackComponent>
                    <ControllerTextareaComponent disabled={disabled} placeholder='Vul hier iets over jezelf in...'
                        errors={errors} control={control} inputName={'about'}
                        labelName={'Over'} />
                </VStackComponent>
            </HStackComponent>
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent disabled={disabled} placeholder='Vul hier uw contactnummer in...'
                    errors={errors}
                    control={control} inputName={'contact'}
                    labelName={'Contact'} />
            </HStackComponent>
            <VStackComponent className={'items-start'}>
                <Label htmlFor={'availibity'} className="text-left">
                    Beschikbaarheid
                </Label>
                <Controller
                    name={'availabilityRange'}
                    control={control}
                    render={({ field }) => (
                        <HStackComponent>
                            {!disabled && (
                                <CommonSelectComponent selectOption={[{ value: 'WEEK', label: 'Week' }, {
                                    value: 'MONTH',
                                    label: 'Month'
                                }, { value: 'YEAR', label: 'Year' }, { value: 'CUSTOM', label: 'Custom' }]}
                                    placeholder={'Select available days'} selectedValue={field.value}
                                    onChange={(value) => {
                                        field.onChange(value)
                                        const inputStartDateFilter = new Date()
                                        const inputEndDateFilter = new Date()
                                        setIsCustom(false)
                                        if (value === 'MONTH') {
                                            inputStartDateFilter.setDate(1)
                                            setStartDate(inputStartDateFilter);
                                            inputEndDateFilter.setDate(31);
                                            inputEndDateFilter.setHours(24, 60, 60)
                                            setEndDate(inputEndDateFilter)
                                        } else if (value === 'WEEK') {
                                            setStartDate(inputStartDateFilter)
                                            const endDateSetTime = addDays(inputEndDateFilter, 7)
                                            endDateSetTime.setHours(24, 60, 60)
                                            setEndDate(endDateSetTime)
                                        } else if (value === 'YEAR') {
                                            inputStartDateFilter.setMonth(0, 1)
                                            setStartDate(inputStartDateFilter);
                                            inputEndDateFilter.setMonth(11, 31)
                                            inputEndDateFilter.setHours(24, 60, 60)
                                            setEndDate(inputEndDateFilter)
                                        } else {
                                            setIsCustom(true)
                                        }
                                    }} />
                            )}
                            <CalendarDateRangePicker disabled={!isCustom || disabled} setEndDate={setEndDate} setStartDate={setStartDate} startDate={startDate}
                                endDate={endDate} />
                        </HStackComponent>
                    )} />
            </VStackComponent>
            <HStackComponent>
                <Controller
                    name={'skills'}
                    control={control}
                    render={({ field }) => (
                        <VStackComponent className="w-full items-start">
                            {!isEmpty(field.value) && (
                                <>
                                    <Label htmlFor={'skills'} className="text-left">
                                        Selecteer Vaardigheden
                                    </Label>
                                    <HStackComponent className={'justify-between'}>
                                        <MultiSelectCommon disabled={disabled} placeholder={'Select skills.'}
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
                                            }))} />
                                        {loadSkills && (
                                            <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {/*{!disabled && <AddSkillsModalComponent setSkillSet={setSkillSet}/>}*/}
                                    </HStackComponent>
                                </>
                            )}
                            {errors['skills'] && errors['skills']?.message &&
                                <span className={"text-errorText text-sm font-bold"}>
                                    {errors['skills']?.message as never}
                                </span>
                            }
                        </VStackComponent>
                    )}
                />

            </HStackComponent>
            {!disabled && (
                <HStackComponent className={'items-start'}>
                    <ControllerInputComponent disabled={disabled} placeholder='Voer hier uw wachtwoord in...'
                        type='password'
                        errors={errors} control={control} inputName={'password'}
                        labelName={'Wachtwoord'} />
                    <ControllerInputComponent disabled={disabled} placeholder='Bevestig hier uw wachtwoord...'
                        type='password'
                        errors={errors} control={control} inputName={'confirmPassword'}
                        labelName={'Bevestig wachtwoord'} />
                </HStackComponent>
            )}
            {!disabled && !isEmpty(selectedServiceProviders?.agreement) && (
                <Button variant={'link'} className="flex w-fit items-center p-0 text-gray-500" disabled={isLoading} type={'button'} onClick={() => window.open(`${process.env.NEXT_PUBLIC_URL}/user/getUserProfileImage/${selectedServiceProviders?.profile_image}`, '_blank')}>
                    <span className={'text-black mr-1'}>Agreement:</span> {selectedServiceProviders?.agreement ?? ''} <TbExternalLink className={'h-5 w-5 ml-1 -mt-0.5'} />
                </Button>
            )}
            {!disabled && (
                <Button className="flex w-full mt-4" disabled={isLoading}>
                    {isLoading && (
                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Gebruiker bijwerken
                </Button>
            )}
        </form>
    )
};

export default CommonServiceProviderViewComponent;
