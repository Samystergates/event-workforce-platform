"use client"
import React, {useEffect, useState} from "react"
import {IconsComponent} from "@/components/common/icons.component"
import {Button} from "@/components/ui/button"
import ControllerInputComponent from "@/components/forms/controller-input.component";
import {yupResolver} from "@hookform/resolvers/yup";
import {Controller, useForm} from "react-hook-form";
import {mixed, number, object, ref, string} from "yup";
import {useRouter} from "next/navigation";
import {isEmpty, isNull, isUndefined} from "lodash";
import CommonSelectComponent from "@/components/common/common-select.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import AddSkillsModalComponent from "@/components/modals/add-skills-modal.component";
import {useAppDispatch} from "@/redux/hooks";
import {axios} from "@/lib/axiosInstance";
import {saveSkill} from "@/redux/reducers/skillReducers";
import useAuthRequest from "@/lib/useAuthRequest";
import {useToast} from "@/components/ui/use-toast";
import {getAllSkills} from "@/redux/actions/skillActions";
import VStackComponent from "@/components/common/vertical-stack.component";
import MultiSelectCommon from "@/components/common/common-multiselect.component";
import {Label} from "@/components/ui/label";
import ProfilePhotoComponent from "@/components/common/profile-photo.component";

const userAuthSchema = object({
    email: string().email('Invalid email address.').required('Dit veld is verplicht.'),
    password: string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
    confirmPassword: string().oneOf([ref('password')], 'Passwords must match').required('Confirm Password is required'),
    name: string().required('Dit veld is verplicht.'),
    depId: number().required('Dit veld is verplicht.'),
    about: string().required('Dit veld is verplicht.'),
    profile_photo: mixed().required('Dit veld is verplicht.')
});

const userType: { label: string, value: number }[] = [
    {value: 1, label: 'Client'},
    {value: 3, label: 'Freelancer'},
]

export function UserSignupAuthForm() {
    useAuthRequest()
    const route = useRouter()
    const [error, setError] = useState<string | null>(null);
    const [userTypeId, setUserTypeId] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch()
    const [skillSet, setSkillSet] = useState<{ value: number, label: string }[]>([]);
    const [loadSkills, setLoadSkills] = useState<boolean>(false);
    const {toast} = useToast()

    useEffect(() => {
        dispatch(saveSkill(skillSet.map(value => ({id: value.value, name: value.label}))))
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
        formState: {errors},
    } = useForm<any>({
        resolver: yupResolver(userAuthSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            about: '',
            street: '',
            zip: '',
            city: '',
            depId: '1',
            active: true,
            availabilityStatus: true,
            rating: 0,
            description: '',
            age: '',
            contact: '',
            skills: undefined,
            billingInfo: '',
            preferences: '',
            occupation: '',
            profile_photo: ''
        },
    })

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        setError(null)
        const commonValues = {
            ...data,
            name: data.name,
            email: data.email,
            password: data.password,
            about: data.about,
            street: data.street,
            zip: data.zip,
            city: data.city,
            depId: data.depId,
            active: true,
            day_rate: data.discussed_rate
        }
        const clientValues = {
            ...commonValues,
            billingInfo: data.billingInfo,
            preferences: data.preferences,
            occupation: data.occupation
        }
        const serviceProvidersValues = {
            ...commonValues,
            availabilityStatus: data.availabilityStatus,
            rating: data.rating,
            description: data.description,
            age: data.age,
            contact: data.contact,
            skills: data.skills?.map((skill: number) => ({id: Number(skill)}))
        }
        const moderatorsValues = {...commonValues}

        const signupData = await axios.post('/v1/auth/register', data.depId === 1 ? clientValues : data.depId === 2 ? moderatorsValues : serviceProvidersValues)

        if (signupData.data.id) {
            const formData = new FormData();
            formData.append('userId', signupData.data.id)
            formData.append('profile_image', data.profile_photo)

            await axios.post('/user/updateUserProfileImage', formData)
            toast({
                description: "You have successfully signed up. Please try logging in to visit dashboard.",
            })
            setIsLoading(false)
            route.replace('/')
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
                    render={({field}) => (
                        <ProfilePhotoComponent
                            notLabelShow
                            image={field.value}
                            onChangeHandler={(e) => {
                                if (e.target.files) {
                                    field.onChange(e.target.files[0])
                                }
                            }}/>
                    )}
                />
            </VStackComponent>
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your name here...'  errors={errors}
                                          control={control} inputName={'name'}
                                          labelName={'Full name'}/>
                <ControllerInputComponent placeholder='Enter your email here...'  errors={errors}
                                          control={control} inputName={'email'}
                                          labelName={'Email'}/>
            </HStackComponent>
            <ControllerTextareaComponent placeholder='Enter about yourself here...'
                                         errors={errors} control={control} inputName={'about'}
                                         labelName={'About'}/>
            <Controller
                name={'depId'}
                control={control}
                render={({field}) => (
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
            {userTypeId === 3 &&
                <ControllerTextareaComponent placeholder='Enter your description here...'
                                             errors={errors} control={control} inputName={'description'}
                                             labelName={'Description'}/>}
            {userTypeId === 1 && <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your preferences here...'  errors={errors}
                                          control={control} inputName={'preferences'}
                                          labelName={'Preferences'}/>
                <ControllerInputComponent placeholder='Enter your occupation here...'  errors={errors}
                                          control={control} inputName={'occupation'}
                                          labelName={'Occupation'}/>
            </HStackComponent>}
            {userTypeId === 1 &&
                <ControllerTextareaComponent placeholder='Enter your billing address here...'
                                             errors={errors} control={control} inputName={'billingInfo'}
                                             labelName={'Billing Info'}/>}
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your discussed rate here...'  errors={errors}
                                          control={control} inputName={'discussed_rate'}
                                          labelName={'Full name'}/>
                <ControllerInputComponent placeholder='Enter your discussed rate railway work here...'  errors={errors}
                                          control={control} inputName={'discussed_rate_rw'}
                                          labelName={'Email'}/>
            </HStackComponent>
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your hour rate here...'  errors={errors}
                                          control={control} inputName={'hour_rate'}
                                          labelName={'Full name'}/>
                <ControllerInputComponent placeholder='Enter your hour rate railway work here...'  errors={errors}
                                          control={control} inputName={'hour_rate_rw'}
                                          labelName={'Email'}/>
            </HStackComponent>
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your night rate here...'  errors={errors}
                                          control={control} inputName={'night_rate'}
                                          labelName={'Full name'}/>
                <ControllerInputComponent placeholder='Enter your night rate railway work here...'  errors={errors}
                                          control={control} inputName={'night_rate_rw'}
                                          labelName={'Email'}/>
            </HStackComponent>
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your weekend rate here...'  errors={errors}
                                          control={control} inputName={'weekend_rate'}
                                          labelName={'Full name'}/>
                <ControllerInputComponent placeholder='Enter your weekend rate railway work here...'  errors={errors}
                                          control={control} inputName={'weekend_rate_rw'}
                                          labelName={'Email'}/>
            </HStackComponent>
            {userTypeId === 3 && (
                <>
                    <HStackComponent className={'items-start'}>
                        <ControllerInputComponent placeholder='Enter your age here...'  errors={errors}
                                                  control={control} inputName={'age'}
                                                  labelName={'Age'}/>
                        <ControllerInputComponent placeholder='Enter your contact number here...'
                                                  errors={errors}
                                                  control={control} inputName={'contact'}
                                                  doNotUseFieldOnChange
                                                  onChangeHandler={(e) => {
                                                      const regex = /^[0-9]+$/;
                                                      if (regex.test(e.target.value.replaceAll('+' , '')) || isEmpty(e.target.value.replaceAll('+' , ''))) {
                                                          setValue('contact', isEmpty(e.target.value.replaceAll('+' , '')) ? '' : `+${e.target.value.replaceAll('+' , '')}`)
                                                      }
                                                  }}
                                                  labelName={'Contact'}/>
                    </HStackComponent>
                    <HStackComponent>
                        <Controller
                            name={'skills'}
                            control={control}
                            render={({field}) => (
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
                                                               selectedValue={field.value ? skillSet.filter(clients => field.value.includes(clients.value)).map(value => ({ value: `${value.value}`, label: value.label })) : []}
                                                               selectOption={skillSet.map(value => ({ value: `${value.value}`, label: value.label }))}/>
                                            {loadSkills && (
                                                <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
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
                </>
            )}
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent placeholder='Enter your password here...' type='password'
                                          errors={errors} control={control} inputName={'password'}
                                          labelName={'Password'}/>
                <ControllerInputComponent placeholder='Confirm your password here...' type='password'
                                          errors={errors} control={control} inputName={'confirmPassword'}
                                          labelName={'Confirm Password'}/>
            </HStackComponent>
            <Button className="flex w-full mt-4" disabled={isLoading}>
                {isLoading && (
                    <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                )}
                Sign up with username
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
                --- OR ---
            </p>
            <Button variant={'outline'} type={'button'} className={'w-full'} onClick={() => route.replace('/')}>
                Sign in
            </Button>
        </form>
    )
}
