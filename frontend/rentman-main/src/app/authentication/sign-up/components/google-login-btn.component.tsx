"use client"
import React, {useState} from 'react';
import {IconsComponent} from "@/components/common/icons.component";
import {Button} from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginBtnComponent = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    return (
        <Button className="flex w-full" disabled={isLoading} variant={'outline'}>
            {isLoading && (
                <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
            )}
            Sign In with Gmail <FcGoogle className={"ml-2 w-5 h-5"}/>
        </Button>
    );
};

export default GoogleLoginBtnComponent;
