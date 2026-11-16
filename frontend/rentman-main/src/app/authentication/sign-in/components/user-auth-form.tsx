"use client"

import React, {useState, useEffect} from "react"
import {IconsComponent} from "@/components/common/icons.component"
import {Button} from "@/components/ui/button"
import ControllerInputComponent from "@/components/forms/controller-input.component";
import {yupResolver} from "@hookform/resolvers/yup";
import {useForm} from "react-hook-form";
import {object, string} from "yup";
import {useRouter} from "next/navigation";
import GoogleLoginBtnComponent from "./google-login-btn.component";
import {isNull} from "lodash";
import {signIn} from "next-auth/react";
import {useToast} from "@/components/ui/use-toast";
import {NextResponse} from "next/server";
import {Dictionary, getDictionary} from "../../../../../dictionary";

export function UserAuthForm({lang}: {lang: Dictionary}) {
    const route = useRouter()
    const {toast} = useToast()
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const userAuthSchema = object({
        email: string().email(lang.auth.invalidEmail).required(lang.auth.fieldRequired),
        password: string().required(lang.auth.fieldRequired),
    });

    const {
        handleSubmit,
        control,
        formState: {errors},
    } = useForm<{ email: string; password: string; }>({
        resolver: yupResolver(userAuthSchema),
        defaultValues: {
            email: '',
            password: ''
        },
    })

    const onSubmit = async (data: any) => {
        setError(null)
        setIsLoading(true)
        const {email, password} = data

        try {
            const result = await signIn("credentials", {
                email: email,
                password: password,
                redirect: false,
            });

            if (result?.error) {
                setError(result?.error)
            } else if (result?.ok) {
                route.replace('/dashboard')
            }

            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)
            setError(error ? error.toString() : null);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className={"flex flex-col gap-4"}>
                {!isNull(error) && (
                    <div className={'bg-red-100 text-red-500 rounded-md text-sm px-4 py-2'}>
                        {error}
                    </div>
                )}
                <ControllerInputComponent placeholder={lang.auth.signEmail} notShowLabel errors={errors}
                                          control={control} inputName={'email'}
                                          labelName={lang.auth.email}/>
                <ControllerInputComponent placeholder={lang.auth.enterPassword} type='password' notShowLabel
                                          errors={errors} control={control} inputName={'password'}
                                          labelName={lang.auth.password}/>
                <Button className="flex w-full mt-4" disabled={isLoading}>
                    {isLoading && (
                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                    )}
                    {lang.auth.signEmailBtn}
                </Button>
                {/*<p className="px-8 text-center text-sm text-muted-foreground">*/}
                {/*    --- OR ---*/}
                {/*</p>*/}
                {/*<Button variant={'outline'} className={'w-full'} type={'button'} onClick={() => {*/}
                {/*    toast({*/}
                {/*        description: "Request send successfully!",*/}
                {/*    })*/}
                {/*}}>*/}
                {/*    Request for account*/}
                {/*</Button>*/}
            </form>
        </div>
    )
}
