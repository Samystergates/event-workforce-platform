import type {Metadata} from 'next'
import {UserSignupAuthForm} from "@/app/authentication/sign-up/components/user-signup-auth-form";
import AuthWrapper from "@/wrapper/auth.wrapper";

export const metadata: Metadata = {
    title: 'Eventico | Register',
    description: 'Deliver unforgettable events & media productions.',
}

export default function AuthenticationSignUpPage() {
    return (
        <AuthWrapper>
            <div className="mx-auto flex w-full flex-col  gap-4 pt-[2em]">
                <div className="flex flex-col text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Register
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your details to register your account
                    </p>
                </div>
                <UserSignupAuthForm/>
                <p className="px-8 text-center text-sm text-muted-foreground !pb-[2em]">
                    By clicking continue, you agree to our{" "}
                    <span
                        className="underline underline-offset-4 hover:text-primary"
                    >
                Terms of Service
              </span>{" "}
                    and{" "}
                    <span
                        className="underline underline-offset-4 hover:text-primary"
                    >
                Privacy Policy
              </span>
                    .
                </p>
            </div>
        </AuthWrapper>
    )
}
