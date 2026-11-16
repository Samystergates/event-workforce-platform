"use client"
import React, {useState} from 'react';
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button} from "@/components/ui/button";
import {IoRefresh} from "react-icons/io5";
import EventTableComponent from "@/app/(protected)/job-requests/components/event-table.component";
import {getRequestJobs} from "@/redux/actions";
import {useSession} from "next-auth/react";
import {IconsComponent} from "@/components/common/icons.component";

const JobRequest = () => {
    const [eventsDisplayType, setEventsDisplayType] = useState<string>('allEvents');
    const [eventsLoading, setEventsLoading] = useState<boolean>(false);
    const { data: session } = useSession()

    const handleRefresh = () => {
        if(session) {
            const {user} = session
            getRequestJobs(`${user.id}`, setEventsLoading, eventsDisplayType).then(null)
        }
    }

    return (
        <div>
            <HStackComponent className={'justify-between'}>
                <h1 className={'font-bold text-xl'}>Evenementen</h1>
                <Button onClick={handleRefresh}>
                    <HStackComponent className={'gap-2'}>
                        <p>Vernieuwen</p> {eventsLoading ? <IconsComponent.spinner className="h-3 w-3 animate-spin"/> : <IoRefresh/>}
                    </HStackComponent>
                </Button>
            </HStackComponent>
            <HStackComponent className={'justify-start mt-5'}>
                <Button variant={eventsDisplayType === 'allEvents' ? 'default' : 'outline'} onClick={() => setEventsDisplayType('allEvents')}>Alle evenementen</Button>
                <Button variant={eventsDisplayType === 'inProgress' ? 'default' : 'outline'} onClick={() => setEventsDisplayType('inProgress')}>Gepland evenementen</Button>
                <Button variant={eventsDisplayType === 'pendingEvents' ? 'default' : 'outline'} onClick={() => setEventsDisplayType('pendingEvents')}>In behandeling evenementen</Button>
            </HStackComponent>
            <EventTableComponent eventsDisplayType={eventsDisplayType} eventsLoading={eventsLoading} setEventsLoading={setEventsLoading} />
        </div>
    );
};

export default JobRequest;
