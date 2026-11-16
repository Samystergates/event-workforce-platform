"use client"
import React, {useState, useEffect} from 'react';
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button} from "@/components/ui/button";
import {IoRefresh} from "react-icons/io5";
import EventTableComponent from "@/app/(protected)/all-jobs/components/event-table.component";
import {getAllJobs} from "@/redux/actions";
import {IconsComponent} from "@/components/common/icons.component";

const JobRequest = () => {
    const [eventsDisplayType, setEventsDisplayType] = useState<string>('allEvents');
    const [eventsLoading, setEventsLoading] = useState<boolean>(false);

    const handleRefresh = () => {
        getAllJobs(setEventsLoading, eventsDisplayType).then(null)
    }

    useEffect(() => {
        getAllJobs(setEventsLoading, eventsDisplayType).then(null)
    }, [eventsDisplayType]);


    return (
        <div>
            <HStackComponent className={'justify-between !flex-row'}>
                <h1 className={'font-bold text-xl'}>Evenementen</h1>
                <Button onClick={handleRefresh}>
                    <HStackComponent className={'gap-2 !flex-row'}>
                        <p>Vernieuwen</p> {eventsLoading ? <IconsComponent.spinner className="h-3 w-3 animate-spin"/> :
                        <IoRefresh/>}
                    </HStackComponent>
                </Button>
            </HStackComponent>
            <HStackComponent className={'justify-start mt-5 !flex-row !flex-wrap'}>
                <Button variant={eventsDisplayType === 'allEvents' ? 'default' : 'outline'}
                        onClick={() => setEventsDisplayType('allEvents')}>Alle evenementen</Button>
                <Button variant={eventsDisplayType === 'inProgress' ? 'default' : 'outline'}
                        onClick={() => setEventsDisplayType('inProgress')}>Geplande evenementen</Button>
                <Button variant={eventsDisplayType === 'pendingEvents' ? 'default' : 'outline'}
                        onClick={() => setEventsDisplayType('pendingEvents')}>Gebeurtenissen in behandeling</Button>
                <Button variant={eventsDisplayType === 'acceptedEvents' ? 'default' : 'outline'}
                        onClick={() => setEventsDisplayType('acceptedEvents')}>Geaccepteerde evenementen</Button>
                <Button variant={eventsDisplayType === 'declineEvents' ? 'default' : 'outline'}
                        onClick={() => setEventsDisplayType('declineEvents')}>Gebeurtenissen weigeren</Button>
            </HStackComponent>
            <EventTableComponent eventsDisplayType={eventsDisplayType} eventsLoading={eventsLoading}
                                 setEventsLoading={setEventsLoading}/>
        </div>
    );
};

export default JobRequest;
