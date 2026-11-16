import type {Metadata} from 'next'
import {UserSignupAuthForm} from "@/app/(protected)/create-user/components/user-signup-auth-form";
import LoginSidebarComponent from "@/components/auth/login-sidebar.component";
import React from "react";

export const metadata: Metadata = {
    title: 'Eventico | Register',
    description: 'Deliver unforgettable events & media productions.',
}

export default function AuthenticationSignUpPage() {
    return (
        <div className="flex h-screen">
            <LoginSidebarComponent />
            <div className={`flex justify-center rounded-2xl absolute md:relative p-8 top-[11%] right-[5%] h-[80vh] md:right-0 md:top-0 md:h-auto w-11/12 md:w-4/6 overflow-auto`}
                 style={{backgroundImage: 'linear-gradient(rgb(255, 255, 255, 0.90) 75%, rgb(254, 229, 0, 0.90) 110%)'}}>
                <div className='flex w-full md:w-5/6'>
                    <div className="mx-auto flex w-full flex-col  gap-4">
                        <div className="flex flex-col text-center mb-6">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Gebruiker registreren
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Voer nieuwe gebruikersgegevens in om het account te registreren
                            </p>
                        </div>
                        <UserSignupAuthForm/>
                        <p className="px-8 text-center text-sm text-muted-foreground !pb-[2em]">
                            Door op doorgaan te klikken, gaat u akkoord met onze{" "}
                            <span
                                className="underline underline-offset-4 hover:text-primary"
                            >
                Servicevoorwaarden
              </span>{" "}
                            and{" "}
                            <span
                                className="underline underline-offset-4 hover:text-primary"
                            >
                Privacybeleid
              </span>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
