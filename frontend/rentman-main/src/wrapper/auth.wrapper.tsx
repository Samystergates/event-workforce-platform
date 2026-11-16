'use client';

import React from 'react';
import LoginSidebarComponent from "@/components/auth/login-sidebar.component";
import {IconsComponent} from "@/components/common/icons.component";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

const AuthWrapper = ({children, className}: { children: React.ReactNode, className?: string }) => {
    const { data: session, status } = useSession()
    const router = useRouter();

    if (session) {
        router.replace('/dashboard')
        return (
            <div className={'h-screen flex items-center justify-center'}>
                <IconsComponent.spinner className="mr-2 h-6 w-6 mb-1 animate-spin" /><p>Laden</p>
            </div>
        )
    }

    if (status === 'loading') {
        return (
            <div className={'h-screen flex items-center justify-center'}>
                <IconsComponent.spinner className="mr-2 h-6 w-6 mb-1 animate-spin" /><p>Laden</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen">
            <LoginSidebarComponent />
            <div className={`flex justify-center absolute top-1/3 p-6 rounded-xl right-[5%] md:right-0 w-11/12 md:w-4/6 md:relative md:top-0 overflow-auto ${className}`} style={{backgroundImage: 'linear-gradient(rgb(255, 255, 255, 0.90) 75%, rgb(254, 229, 0, 0.90) 110%)'}}>
                <div className='flex w-full md:w-5/6'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthWrapper;
