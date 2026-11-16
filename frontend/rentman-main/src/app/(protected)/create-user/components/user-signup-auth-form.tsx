"use client"

import React, { useEffect, useState } from "react"
import { IconsComponent } from "@/components/common/icons.component"
import { Button } from "@/components/ui/button"
import ControllerInputComponent from "@/components/forms/controller-input.component";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { number, object, ref, string } from "yup";
import { isEmpty, isNull } from "lodash";
import CommonSelectComponent from "@/components/common/common-select.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import AddSkillsModalComponent from "@/components/modals/add-skills-modal.component";
import { useAppDispatch } from "@/redux/hooks";
import { axios } from "@/lib/axiosInstance";
import { saveSkill } from "@/redux/reducers/skillReducers";
import useAuthRequest from "@/lib/useAuthRequest";
import { useToast } from "@/components/ui/use-toast";
import { getAllSkills } from "@/redux/actions/skillActions";
import VStackComponent from "@/components/common/vertical-stack.component";
import MultiSelectCommon from "@/components/common/common-multiselect.component";
import { Label } from "@/components/ui/label";
import { signOut } from "next-auth/react";
import ControlCustomYearDateSelectorComponent from "@/components/forms/control-custom-year-date-selector.component";
import ProfilePhotoComponent from "@/components/common/profile-photo.component";
import { Checkbox } from "@/components/ui/checkbox";

const userAuthSchema = object({
    email: string().email('Invalid email address.').required('Dit veld is verplicht.'),
    password: string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
    confirmPassword: string().oneOf([ref('password')], 'Passwords must match').required('Confirm Password is required'),
    first_name: string().required('Dit veld is verplicht.'),
    depId: number().required('Dit veld is verplicht.'),
    about: string().required('Dit veld is verplicht.'),
});

const userType: { label: string, value: number }[] = [
    { value: 1, label: 'Client' },
    { value: 3, label: 'Freelancer' },
]

const clientEventRateType: { label: string, value: string }[] = [
    { value: 'EVENT', label: 'Event' },
    { value: 'RAILWORK', label: 'Rail work' },
]

const rateType: { label: string, value: string }[] = [
    { value: 'DAY', label: 'Day' },
    { value: 'HOURLY', label: 'Hourly' },
]

const driverSelection: { label: string, value: string }[] = [
    { value: 'B', label: 'B' },
    { value: 'BE', label: 'BE' },
    { value: 'C', label: 'C' },
    { value: 'CE', label: 'CE' },
    { value: 'C1', label: 'C1' },
    { value: 'CODE95', label: 'CODE95' },
]

export function UserSignupAuthForm() {
    useAuthRequest()
    const [loadingLogout, setLoadingLogout] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null);
    const [userTypeId, setUserTypeId] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch()
    const [skillSet, setSkillSet] = useState<{ value: number, label: string }[]>([]);
    const [loadSkills, setLoadSkills] = useState<boolean>(false);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const endOfMonth = new Date();
    endOfMonth.setDate(31);
    const [isCustom, setIsCustom] = useState<boolean>(false)
    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);
    const [rateTypeSelection, setRateTypeSelection] = useState<string>('DAY')
    const [timeBasedRate, setTimeBasedRate] = useState<boolean>(false)
    const { toast } = useToast()

    useEffect(() => {
        dispatch(saveSkill(skillSet.map(value => ({ id: value.value, name: value.label }))))
    }, [skillSet]);

    useEffect(() => {
        const fetchSkills = async () => {
            await getAllSkills(setLoadSkills, setSkillSet)
        }

        fetchSkills().then(null)
    }, []);

    const {
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm<any>({
        resolver: yupResolver(userAuthSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirmPassword: '',
            about: '',
            street: '',
            city: '',
            zip: '',
            depId: '1',
            active: true,
            availabilityStatus: true,
            rating: 0,
            skills: undefined,
            client_event_rate_type: 'EVENT'
        },
    })

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        setError(null)
        const signupData = await axios.post('/v1/auth/register', {
            ...data,
            skills: userTypeId === 3 ? data.skills ? data.skills.map((skills: any) => ({ id: skills })) : [] : undefined,
            agreement: undefined,
            kilometer_rate: data.kilometer_rate ? data.kilometer_rate.replaceAll(',', '.') : undefined,
            hour_rate: data.hour_rate ? data.hour_rate.replaceAll(',', '.') : undefined,
            hour_rate_rw: data.hour_rate_rw ? data.hour_rate_rw.replaceAll(',', '.') : undefined,
            discussed_rate: data.discussed_rate ? data.discussed_rate.replaceAll(',', '.') : undefined,
            discussed_rate_rw: data.discussed_rate_rw ? data.discussed_rate_rw.replaceAll(',', '.') : undefined,
            day_rate: data.day_rate ? data.day_rate.replaceAll(',', '.') : undefined,
            night_rate: data.night_rate ? data.night_rate.replaceAll(',', '.') : undefined,
            night_rate_rw: data.night_rate_rw ? data.night_rate_rw.replaceAll(',', '.') : undefined,
            weekend_rate: data.weekend_rate ? data.weekend_rate.replaceAll(',', '.') : undefined,
            weekend_rate_rw: data.weekend_rate_rw ? data.weekend_rate_rw.replaceAll(',', '.') : undefined,
            profile_photo: undefined
        })
        if (signupData.data.id) {
            const formData = new FormData();
            formData.append('userId', signupData.data.id)
            formData.append('profile_image', data.profile_photo)

            await axios.post('/user/updateUserProfileImage', formData)

            const formData1 = new FormData();
            formData1.append('userId', signupData.data.id)
            formData1.append('file', data.agreement)

            await axios.post('/user/updateUserAgreement', formData1)

            toast({
                description: "You have successfully created a user!",
            })
            reset()
            setValue("discussed_rate", undefined)
            setValue("discussed_rate_type", undefined)
            setValue("business_registration", undefined)
            setValue("contact_person", undefined)
            setValue("phone_number", undefined)
            setValue("invoice_mail", undefined)
            setValue("phone_number_planning", undefined)
            setValue("sector", undefined)
            setValue("street", "")
            setValue("city", "")
            setValue("zip", "")
            setValue("kilometer_rate", undefined)
            setValue("business_registration", undefined)
            setValue("depId", "1")
            setUserTypeId(1)
            setIsLoading(false)
        } else {
            setError(signupData?.data?.error ?? `${signupData.data}`)
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={"flex flex-col gap-4"}>
            {!isNull(error) && (
                <div className={'bg-red-100 text-red-300 rounded-md text-sm px-4 py-2'}>
                    {error}
                </div>
            )}
            <VStackComponent>
                <Controller
                    name={'profile_photo'}
                    control={control}
                    render={({ field }) => (
                        <ProfilePhotoComponent
                            image={field.value}
                            onChangeHandler={(e) => {
                                if (e.target.files) {
                                    field.onChange(e.target.files[0])
                                }
                            }} />
                    )}
                />
            </VStackComponent>
            <HStackComponent>
                <ControllerInputComponent placeholder='Vul hier uw voornaam in...' errors={errors}
                    control={control} inputName={'first_name'}
                    labelName={'First name'} />
                <ControllerInputComponent placeholder='Vul hier uw achternaam in...' errors={errors}
                    control={control} inputName={'last_name'}
                    labelName={'Last name'} />
            </HStackComponent>
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Vul hier uw e-mailadres in...' errors={errors}
                    control={control} inputName={'email'}
                    labelName={'Email'} />
                {userTypeId === 3 &&
                    <ControlCustomYearDateSelectorComponent
                        // onChange={(e) => setEventTimeline(prevState => ({...prevState, end_date: e}))}
                        placeholder='Datum selecteren...'
                        errors={errors} control={control} inputName={'date_of_birth'}
                        labelName={'Date of birth'} />}
            </HStackComponent>
            <ControllerTextareaComponent placeholder='Vul hier iets over jezelf in...'
                errors={errors} control={control} inputName={'about'}
                labelName={'About'} />
            <HStackComponent>
                <ControllerInputComponent placeholder='Vul hier uw plaats in..'
                    errors={errors} control={control} inputName={'city'}
                    labelName={'City'} />
                <ControllerInputComponent placeholder='Vul hier uw straat in...'
                    errors={errors} control={control} inputName={'street'}
                    labelName={'Street'} />
                <ControllerInputComponent placeholder='Vul hier uw postcode in...'
                    errors={errors} control={control} inputName={'zip'}
                    labelName={'Zip'} />
            </HStackComponent>
            <HStackComponent>
                <ControllerInputComponent placeholder='Vul hier uw tarief in...' errors={errors}
                    control={control} inputName={'discussed_rate'}
                    labelName={'Rate'} />
                {userTypeId !== 1 ? (
                    <ControllerInputComponent placeholder='Vul hier uw bedrijfsregistratie in...' errors={errors}
                        control={control} inputName={'business_registration'}
                        labelName={'Business registration'} />
                ) : (
                    <Controller
                        name={'discussed_rate_type'}
                        control={control}
                        render={({ field }) => (
                            <VStackComponent className={'items-start'}>
                                <Label htmlFor={'skills'} className="text-left">
                                    {'Tarieftype'}
                                </Label>
                                <CommonSelectComponent
                                    placeholder={'Selecteer tarieftype'}
                                    // onChange={field.onChange}
                                    onChange={(value) => {
                                        field.onChange(value)
                                        setRateTypeSelection(value)
                                    }}
                                    selectedValue={field.value}
                                    selectOption={rateType}
                                />
                                {errors['discussed_rate_type'] && errors['discussed_rate_type']?.message &&
                                    <span className={"text-errorText text-sm font-bold"}>
                                        {errors['discussed_rate_type']?.message as never}
                                    </span>
                                }
                            </VStackComponent>
                        )}
                    />
                )}
            </HStackComponent>
            {/*{userTypeId === 1 && (*/}
            {/*    <VStackComponent className={"items-start"}>*/}
            {/*        <HStackComponent className={"gap-2 !w-fit !flex-row"}>*/}
            {/*            <Checkbox onClick={() => setTimeBasedRate(!timeBasedRate)} checked={timeBasedRate} id="time_rate" />*/}
            {/*            <label*/}
            {/*                htmlFor="time_rate"*/}
            {/*                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"*/}
            {/*            >*/}
            {/*                Op tijd gebaseerd tarief*/}
            {/*            </label>*/}
            {/*        </HStackComponent>*/}
            {/*        {timeBasedRate && (*/}
            {/*            <HStackComponent>*/}
            {/*                <ControllerInputComponent placeholder='Vul hier uw dagtarief in...' errors={errors}*/}
            {/*                                          control={control} inputName={'day_rate'}*/}
            {/*                                          labelName={'Day rate'}/>*/}
            {/*                <ControllerInputComponent placeholder='Vul hier uw nachttarief in...' errors={errors}*/}
            {/*                                          control={control} inputName={'night_rate'}*/}
            {/*                                          labelName={'Night rate'}/>*/}
            {/*                <ControllerInputComponent placeholder='Vul hier uw weekendtarief in...' errors={errors}*/}
            {/*                                          control={control} inputName={'weekend_rate'}*/}
            {/*                                          labelName={'Weekend rate'}/>*/}
            {/*            </HStackComponent>*/}
            {/*        )}*/}
            {/*    </VStackComponent>*/}
            {/*)}*/}
            <HStackComponent>
                {userTypeId === 1 && (
                    <ControllerInputComponent placeholder='Vul hier uw bedrijfsregistratie in...' errors={errors}
                        control={control} inputName={'business_registration'}
                        labelName={'Business registration'} />
                )}
                <Controller
                    name={'depId'}
                    control={control}
                    render={({ field }) => (
                        <VStackComponent className={'items-start'}>
                            <Label htmlFor={'skills'} className="text-left">
                                {'Profile type'}
                            </Label>
                            <CommonSelectComponent
                                placeholder={'Select user type'}
                                onChange={(e) => {
                                    field.onChange(Number(e));
                                    setUserTypeId(Number(e))
                                }}
                                selectedValue={field.value}
                                selectOption={userType}
                            />
                            {errors['depId'] && errors['depId']?.message &&
                                <span className={"text-errorText text-sm font-bold"}>
                                    {errors['depId']?.message as never}
                                </span>
                            }
                        </VStackComponent>
                    )}
                />
            </HStackComponent>
            {userTypeId === 1 && rateTypeSelection !== 'HOURLY' && (
                <HStackComponent className={'items-start'}>
                    <ControllerInputComponent placeholder='Enter your discussed rate here...' errors={errors}
                        control={control} inputName={'discussed_rate'}
                        labelName={'Discussed rate'} />
                    <ControllerInputComponent placeholder='Enter your discussed rate railway work here...' errors={errors}
                        control={control} inputName={'discussed_rate_rw'}
                        labelName={'Discussed rate railway work'} />
                </HStackComponent>
            )}
            {userTypeId === 1 && rateTypeSelection !== 'DAY' && (
                <HStackComponent className={'items-start'}>
                    <ControllerInputComponent placeholder='Enter your hour rate here...' errors={errors}
                        control={control} inputName={'hour_rate'}
                        labelName={'Hour rate'} />
                    <ControllerInputComponent placeholder='Enter your hour rate railway work here...' errors={errors}
                        control={control} inputName={'hour_rate_rw'}
                        labelName={'Hour rate railway'} />
                </HStackComponent>
            )}
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your night rate here...' errors={errors}
                    control={control} inputName={'night_rate'}
                    labelName={'Night rate'} />
                <ControllerInputComponent placeholder='Enter your night rate railway work here...' errors={errors}
                    control={control} inputName={'night_rate_rw'}
                    labelName={'Night rate railway'} />
            </HStackComponent>
            {userTypeId === 1 && (
                <ControllerInputComponent placeholder='Enter your minimum payment hour here...' type={'number'} errors={errors}
                    control={control} inputName={'minimum_payment_hour'}
                    labelName={'Minimum payment hour'} />
            )}
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your weekend rate here...' errors={errors}
                    control={control} inputName={'weekend_rate'}
                    labelName={'Weekend rate'} />
                <ControllerInputComponent placeholder='Enter your weekend rate railway work here...' errors={errors}
                    control={control} inputName={'weekend_rate_rw'}
                    labelName={'weekend rate railway work'} />
            </HStackComponent>
            {userTypeId === 1 && (
                <Controller
                    name={'client_event_rate_type'}
                    control={control}
                    render={({ field }) => (
                        <VStackComponent className={'items-start'}>
                            <Label htmlFor={'client_event_rate_type'} className="text-left">
                                {'Event rate type'}
                            </Label>
                            <CommonSelectComponent
                                placeholder={'Select event rate type'}
                                onChange={field.onChange}
                                selectedValue={field.value}
                                selectOption={clientEventRateType}
                            />
                        </VStackComponent>
                    )}
                />
            )}
            {userTypeId === 1 && <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Vul hier uw contactpersoon in...' errors={errors}
                    control={control} inputName={'contact_person'}
                    labelName={'Contact person'} />
                <ControllerInputComponent placeholder='Vul hier uw telefoonnummer in...' errors={errors}
                    control={control} inputName={'phone_number'}
                    labelName={'Phone number'}
                    doNotUseFieldOnChange
                    onChangeHandler={(e) => {
                        const regex = /^[0-9]+$/;
                        if (regex.test(e.target.value.replaceAll('+', '')) || isEmpty(e.target.value.replaceAll('+', ''))) {
                            setValue('phone_number', isEmpty(e.target.value.replaceAll('+', '')) ? '' : `+${e.target.value.replaceAll('+', '')}`)
                        }
                    }}
                />
            </HStackComponent>}
            {userTypeId === 1 && (
                <ControllerInputComponent placeholder='Vul hier uw factuurmail in...' errors={errors}
                    control={control} inputName={'invoice_mail'}
                    labelName={'Invoice mail'} />
            )}
            {userTypeId === 1 && (
                <HStackComponent>
                    <ControllerInputComponent placeholder='Vul hier uw factuurmail in...' errors={errors}
                        control={control} inputName={'kilometer_rate'}
                        labelName={'Kilometer rate'} />
                    <ControllerInputComponent placeholder='Voer hier uw telefoonnummerplanning in...' errors={errors}
                        control={control} inputName={'phone_number_planning'}
                        labelName={'Phone number planning'}
                        doNotUseFieldOnChange
                        onChangeHandler={(e) => {
                            const regex = /^[0-9]+$/;
                            if (regex.test(e.target.value.replaceAll('+', '')) || isEmpty(e.target.value.replaceAll('+', ''))) {
                                setValue('phone_number_planning', isEmpty(e.target.value.replaceAll('+', '')) ? '' : `+${e.target.value.replaceAll('+', '')}`)
                            }
                        }}
                    />
                </HStackComponent>
            )}
            {userTypeId === 3 && (
                <>
                    <HStackComponent className={'items-start'}>
                        <Controller
                            name={'drivers_license'}
                            control={control}
                            render={({ field }) => (
                                <VStackComponent className={'items-start'}>
                                    <Label htmlFor={'drivers_license'} className="text-left">
                                        {'Drivers license'}
                                    </Label>
                                    <CommonSelectComponent
                                        placeholder={'Vul hier uw rijbewijs in...'}
                                        onChange={field.onChange}
                                        selectedValue={field.value}
                                        selectOption={driverSelection}
                                    />
                                    {errors['drivers_license'] && errors['drivers_license']?.message &&
                                        <span className={"text-errorText text-sm font-bold"}>
                                            {errors['drivers_license']?.message as never}
                                        </span>
                                    }
                                </VStackComponent>
                            )}
                        />
                        <ControllerInputComponent placeholder='Vul hier uw contactnummer in...'
                            errors={errors}
                            control={control} inputName={'contact'}
                            doNotUseFieldOnChange
                            onChangeHandler={(e) => {
                                const regex = /^[0-9]+$/;
                                if (regex.test(e.target.value.replaceAll('+', '')) || isEmpty(e.target.value.replaceAll('+', ''))) {
                                    setValue('contact', isEmpty(e.target.value.replaceAll('+', '')) ? '' : `+${e.target.value.replaceAll('+', '')}`)
                                }
                            }}
                            labelName={'Contact'} />
                    </HStackComponent>
                    <HStackComponent>
                        <Controller
                            name={'skills'}
                            control={control}
                            render={({ field }) => (
                                <VStackComponent className="w-full items-start">
                                    <Label htmlFor={'skills'} className="text-left">
                                        {'Select Skills'}
                                    </Label>
                                    <HStackComponent className={'justify-between'}>
                                        <HStackComponent className={'gap-2'}>
                                            <MultiSelectCommon placeholder={'Select skills.'}
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
                                        </HStackComponent>
                                        {/*<AddSkillsModalComponent setSkillSet={setSkillSet}/>*/}
                                    </HStackComponent>
                                    {errors['skills'] && errors['skills']?.message &&
                                        <span className={"text-errorText text-sm font-bold"}>
                                            {errors['skills']?.message as never}
                                        </span>
                                    }
                                </VStackComponent>
                            )}
                        />

                    </HStackComponent>
                    {/*<VStackComponent className={'items-start'}>*/}
                    {/*    <Label htmlFor={'availibity'} className="text-left">*/}
                    {/*        Availability*/}
                    {/*    </Label>*/}
                    {/*    <Controller*/}
                    {/*        name={'availability_options'}*/}
                    {/*        control={control}*/}
                    {/*        render={({field}) => (*/}
                    {/*            <HStackComponent>*/}
                    {/*                <CommonSelectComponent selectOption={[{value: 'WEEK', label: 'Week'}, {*/}
                    {/*                    value: 'MONTH',*/}
                    {/*                    label: 'Month'*/}
                    {/*                }, {value: 'YEAR', label: 'Year'}, {value: 'CUSTOM', label: 'Custom'}]}*/}
                    {/*                                       placeholder={'Select available days'}*/}
                    {/*                                       selectedValue={field.value}*/}
                    {/*                                       onChange={(value) => {*/}
                    {/*                                           field.onChange(value)*/}
                    {/*                                           const inputStartDateFilter = new Date()*/}
                    {/*                                           const inputEndDateFilter = new Date()*/}
                    {/*                                           setIsCustom(false)*/}
                    {/*                                           if (value === 'MONTH') {*/}
                    {/*                                               inputStartDateFilter.setDate(1)*/}
                    {/*                                               setStartDate(inputStartDateFilter);*/}
                    {/*                                               inputEndDateFilter.setDate(31);*/}
                    {/*                                               inputEndDateFilter.setHours(24, 60, 60)*/}
                    {/*                                               setEndDate(inputEndDateFilter)*/}
                    {/*                                           } else if (value === 'WEEK') {*/}
                    {/*                                               setStartDate(inputStartDateFilter)*/}
                    {/*                                               const endDateSetTime = addDays(inputEndDateFilter, 7)*/}
                    {/*                                               endDateSetTime.setHours(24, 60, 60)*/}
                    {/*                                               setEndDate(endDateSetTime)*/}
                    {/*                                           } else if (value === 'YEAR') {*/}
                    {/*                                               inputStartDateFilter.setMonth(0, 1)*/}
                    {/*                                               setStartDate(inputStartDateFilter);*/}
                    {/*                                               inputEndDateFilter.setMonth(11, 31)*/}
                    {/*                                               inputEndDateFilter.setHours(24, 60, 60)*/}
                    {/*                                               setEndDate(inputEndDateFilter)*/}
                    {/*                                           } else {*/}
                    {/*                                               setIsCustom(true)*/}
                    {/*                                           }*/}
                    {/*                                       }}/>*/}
                    {/*                <CalendarDateRangePicker disabled={!isCustom} setEndDate={setEndDate}*/}
                    {/*                                         setStartDate={setStartDate} startDate={startDate}*/}
                    {/*                                         endDate={endDate}/>*/}
                    {/*            </HStackComponent>*/}
                    {/*        )}/>*/}
                    {/*</VStackComponent>*/}
                </>
            )}
            {userTypeId === 1 && (
                <ControllerInputComponent placeholder='Vul hier uw sector in...' errors={errors}
                    control={control} inputName={'sector'}
                    labelName={'Sector'} />
            )}
            {userTypeId === 3 && (
                <ControllerInputComponent placeholder='' type='file'
                    errors={errors} control={control} inputName={'agreement'}
                    labelName={'Agreement document'}
                />
            )}
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Voer hier uw wachtwoord in...' type='password'
                    errors={errors} control={control} inputName={'password'}
                    labelName={'Password'} />
                <ControllerInputComponent placeholder='Bevestig hier uw wachtwoord...' type='password'
                    errors={errors} control={control} inputName={'confirmPassword'}
                    labelName={'Confirm Password'} />
            </HStackComponent>
            <Button className="flex w-full mt-7" disabled={isLoading}>
                {isLoading && (
                    <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Meld u aan met e-mail
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
                --- OR ---
            </p>
            <Button onClick={() => {
                setLoadingLogout(true);
                signOut().then(null)
            }} disabled={loadingLogout} variant={'outline'} type={'button'} className={'w-full'}>
                {loadingLogout && <IconsComponent.spinner className="h-4 w-4 animate-spin" />}
                <span>Uitloggen</span>
            </Button>
        </form>
    )
}
