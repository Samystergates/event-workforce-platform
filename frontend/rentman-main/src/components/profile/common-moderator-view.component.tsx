"use client"
import React, {useEffect, useState} from 'react';
import {object, ref, string} from "yup";
import useAuthRequest from "@/lib/useAuthRequest";
import {useAppSelector} from "@/redux/hooks";
import {useToast} from "@/components/ui/use-toast";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {axios} from "@/lib/axiosInstance";
import {isNull} from "lodash";
import HStackComponent from "@/components/common/horizontal-stack.component";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import {IconsComponent} from "@/components/common/icons.component";
import {Button} from "@/components/ui/button";
import {getSelectedModerator} from "@/redux/actions";

const userAuthSchema = object({
    email: string().email('Invalid email address.').required('Dit veld is verplicht.'),
    password: string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
    confirmPassword: string().oneOf([ref('password')], 'Passwords must match').required('Confirm Password is required'),
    name: string().required('Dit veld is verplicht.'),
    about: string().required('Dit veld is verplicht.'),
});


const CommonModeratorViewComponent = ({userId, disabled}: { userId: string; disabled?: boolean }) => {
    useAuthRequest();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
    const {selectedModerator} = useAppSelector(state => state.user)
    const {toast} = useToast()

    useEffect(() => {
        const fetchSkills = async () => {
            await getSelectedModerator(setLoadingProfile, userId)
        }

        fetchSkills().then(null)
    }, [userId]);

    const {
        handleSubmit,
        control,
        setValue,
        formState: {errors},
    } = useForm<any>({
        resolver: yupResolver(userAuthSchema),
        defaultValues: {
            name: selectedModerator?.first_name ?? '',
            email: selectedModerator?.email ?? '',
            password: '',
            confirmPassword: '',
            about: selectedModerator?.about ?? '',
            depId: '1',
            active: true,
        },
    });

    useEffect(() => {
        setValue('name', selectedModerator?.first_name ?? '')
        setValue('email', selectedModerator?.email ?? '')
        setValue('about', selectedModerator?.about ?? '')
    }, [selectedModerator, setValue]);

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        setError(null)
        const commonValues = {
            name: data.name,
            email: data.email,
            password: data.password,
            about: data.about,
            depId: data.depId,
            active: true,
        }
        const signupData = await axios.post('/v1/auth/register', commonValues)
        if (signupData.data.error) {
            setError(signupData.data.error)
            setIsLoading(false)
        } else {
            toast({
                description: "Profile updated successfully",
            })
            setIsLoading(false)
        }
    }

    if (loadingProfile) {
        return (
            <HStackComponent className={'h-[50vh] w-full gap-1'}>
                <p>Laden</p> <IconsComponent.spinner className="h-4 w-4 animate-spin"/>
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
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent disabled={disabled} placeholder='Enter your name here...' errors={errors}
                                          control={control} inputName={'name'}
                                          labelName={'Full name'}/>
                <ControllerInputComponent disabled={disabled} placeholder='Enter your email here...' errors={errors}
                                          control={control} inputName={'email'}
                                          labelName={'Email'}/>
            </HStackComponent>
            <ControllerTextareaComponent
                disabled={disabled} placeholder='Enter about yourself here...'
                errors={errors} control={control} inputName={'about'}
                labelName={'About'}/>
            <HStackComponent className={'items-start'}>
                <ControllerInputComponent disabled={disabled} placeholder='Enter your password here...' type='password'
                                          errors={errors} control={control} inputName={'password'}
                                          labelName={'Password'}/>
                <ControllerInputComponent disabled={disabled} placeholder='Confirm your password here...'
                                          type='password'
                                          errors={errors} control={control} inputName={'confirmPassword'}
                                          labelName={'Confirm Password'}/>
            </HStackComponent>
            <Button className="flex w-full mt-4" disabled={isLoading}>
                {isLoading && (
                    <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                )}
                Update user
            </Button>
        </form>
    )
};

export default CommonModeratorViewComponent;
