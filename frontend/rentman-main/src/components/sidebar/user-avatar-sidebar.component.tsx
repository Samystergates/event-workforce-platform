import React from 'react';
import {useSession} from "next-auth/react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

const UserAvatarSidebarComponent = ({isCollapsed}: {isCollapsed: boolean}) => {
    const {data: session} = useSession()
    if (!session) return <></>
    const {user} = session

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div
                        className={`flex gap-2 items-center w-full p-2.5 rounded-md ${isCollapsed ? 'justify-center' : 'justify-start bg-primary/90'}`}>
                        <Avatar className="h-7 w-7 rounded-md">
                            <AvatarFallback className={"rounded-md capitalize"}>{user.first_name[0]}</AvatarFallback>
                        </Avatar>
                        {!isCollapsed && <p className={'text-white'}>{user.first_name} {user.last_name ?? ''}</p>}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-4 capitalize">
                    {user.first_name} {user.last_name ?? ''}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default UserAvatarSidebarComponent;
