"use client"
import React from 'react';
import Lottie from "react-lottie-player";
import animationData from "@/assets/animation/login-animation.json";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

const LoginSidebarComponent = () => {
    const router = useRouter()

    return (
        <div
            className="relative h-full flex-col p-10 text-white flex w-full md:w-10/12"
            style={{
                backgroundImage: 'url("/images/auth-image.jpg")',
                backgroundPosition: 'center center',
                backgroundSize: 'cover'
        }}>
            <Button onClick={() => router.replace('/')} variant={'ghost'} className="relative z-20 flex items-center text-lg font-medium w-fit hover:bg-zinc-900 hover:text-white">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-6 w-6"
                >
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                </svg>
                Eventico
            </Button>
            {/*<div className={'h-full flex items-center justify-center'}>*/}
            {/*    <Lottie*/}
            {/*        loop*/}
            {/*        animationData={animationData}*/}
            {/*        play*/}
            {/*        style={{ width: 500, height: 500 }}*/}
            {/*    />*/}
            {/*</div>*/}
        </div>
    );
};

export default LoginSidebarComponent;
