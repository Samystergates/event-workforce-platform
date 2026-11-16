"use client"
import React, {useState, useEffect} from 'react';
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button} from "@/components/ui/button";
import {IoRefresh} from "react-icons/io5";
import {getAllServiceProviders, getClientsJobs, getModeratorJobs} from "@/redux/actions";
import {useSession} from "next-auth/react";
import {IconsComponent} from "@/components/common/icons.component";
import EventTableComponent from "@/app/(protected)/assign-job/components/event-table.component";

const JobRequest = () => {
    const [eventsLoading, setEventsLoading] = useState<boolean>(false);
    const [eventsDisplayType, setEventsDisplayType] = useState<string>('allEvents');
    const {data: session} = useSession()

    const handleRefresh = () => {
        if (session) {
            const {user} = session
            getAllServiceProviders().then(null)
            getClientsJobs(`${user.id}`, setEventsLoading).then(null)
        }
    }

    useEffect(() => {
        if (session) {
            const {user} = session
            getAllServiceProviders().then(null)
            getClientsJobs(`${user.id}`, setEventsLoading).then(null)
        }
    }, [session]);


    return (
        <div>
            <HStackComponent className={'justify-between'}>
                <h1 className={'font-bold text-xl'}>Werkaanvragen</h1>
                <Button onClick={handleRefresh}>
                    <HStackComponent className={'gap-2'}>
                        <p>Vernieuwen</p> {eventsLoading ? <IconsComponent.spinner className="h-3 w-3 animate-spin"/> :
                        <IoRefresh/>}
                    </HStackComponent>
                </Button>
            </HStackComponent>
            <HStackComponent className={'justify-start mt-5'}>
                <Button variant={eventsDisplayType === 'allEvents' ? 'default' : 'outline'} onClick={() => setEventsDisplayType('allEvents')}>Alle evenementen</Button>
                <Button variant={eventsDisplayType === 'assignedEvents' ? 'default' : 'outline'} onClick={() => setEventsDisplayType('assignedEvents')}>Toegewezen evenementen</Button>
                <Button variant={eventsDisplayType === 'pendingEvents' ? 'default' : 'outline'} onClick={() => setEventsDisplayType('pendingEvents')}>Gebeurtenissen in behandeling</Button>
            </HStackComponent>
            <EventTableComponent eventsDisplayType={eventsDisplayType} eventsLoading={eventsLoading} setEventsLoading={setEventsLoading}/>
        </div>
    );
};

export default JobRequest;
