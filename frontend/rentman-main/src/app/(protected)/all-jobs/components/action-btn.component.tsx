"use client"
import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import {IconsComponent} from "@/components/common/icons.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {IEvent} from "@/interfaces/event.interfaces";
import {getAllJobs, moderatorApprovalAction} from "@/redux/actions";
import {useSession} from "next-auth/react";

const ActionBtnComponent = ({eventInfo}: { eventInfo: IEvent }) => {
    const {data: session} = useSession()
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [actionSelected, setActionSelected] = useState<number>(1);

    const handleAcceptReject = (action: number) => {
        if (session) {
            setActionSelected(action)
            moderatorApprovalAction(
                setActionLoading,
                eventInfo,
                action,
                (() => {
                    getAllJobs(setActionLoading, 'pendingEvents').then(null)
                })
            ).then(null)
        }
    }

    return (
        <HStackComponent className={'!flex-row'}>
            <Button className={'min-w-[6rem]'} onClick={() => handleAcceptReject(1)}>
                {actionSelected === 1 && actionLoading ?
                    <IconsComponent.spinner className="h-3 w-3 animate-spin"/> : 'Accept'}
            </Button>
            <Button className={'min-w-[6rem]'} variant={'outline'} onClick={() => handleAcceptReject(-1)}>
                {actionSelected === -1 && actionLoading ?
                    <IconsComponent.spinner className="h-3 w-3 animate-spin"/> : 'Decline'}
            </Button>
        </HStackComponent>
    );
};

export default ActionBtnComponent;
