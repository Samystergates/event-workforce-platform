import {UserAuthForm} from "./authentication/sign-in/components/user-auth-form"
import type {Metadata} from 'next'
import AuthWrapper from "@/wrapper/auth.wrapper";
import {getDictionary} from "../../dictionary";

export const metadata: Metadata = {
    title: 'Eventico | Authentication',
    description: 'Deliver unforgettable events & media productions.',
}

export default async function AuthenticationPage() {
    const lang = await getDictionary('du');

    return (
        <AuthWrapper className={'items-center'}>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {lang.auth.login}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {lang.auth.enterEmailBelow}
                    </p>
                </div>
                <UserAuthForm lang={lang}/>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    {lang.auth.byClicking}{" "}
                    <span
                        className="underline underline-offset-4 hover:text-primary"
                    >
                {lang.auth.termsService}
              </span>{" "}
                    {lang.auth.and}{" "}
                    <span
                        className="underline underline-offset-4 hover:text-primary"
                    >
                {lang.auth.privacy}
              </span>
                    .
                </p>
            </div>
        </AuthWrapper>
    )
}
