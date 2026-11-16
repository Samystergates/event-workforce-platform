"use client"
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import VStackComponent from "@/components/common/vertical-stack.component";
import {IconsComponent} from "@/components/common/icons.component";
import ViewEventModalComponent from "@/app/(protected)/dashboard/components/view-event-modal.component";
import {isEmpty} from "lodash";
import EmptyComponent from "@/components/common/empty.component";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import {
    getAllJobs,
    getAllServiceProvidersWithAvailability,
    getClientsJobs,
    getServiceProvidersJobs, mergeInvoiceAction, resetInvoices
} from "@/redux/actions";
import { PiInvoiceDuotone } from "react-icons/pi";
import useAuthRequest from "@/lib/useAuthRequest";
import HStackComponent from "@/components/common/horizontal-stack.component";
import InvoiceTableComponent from "@/app/(protected)/invoices/components/invoice-table.component";
import moment from "moment";
import {Button} from "@/components/ui/button";
import {IEvent} from "@/interfaces/event.interfaces";
import {defaultEventData} from "@/data/project-details.data";
import {saveSkill} from "@/redux/reducers/skillReducers";
import {getAllSkills} from "@/redux/actions/skillActions";

const Invoices = () => {
    useAuthRequest()
    const [selectedEventInvoice, setSelectedEventInvoice] = useState<IEvent[]>([defaultEventData])
    const [firstSelectedEventInvoice, setFirstSelectedEventInvoice] = useState<IEvent>(defaultEventData)
    const [eventsLoading, setEventsLoading] = useState<boolean>(true);
    const {events, selectedEvent, invoice} = useAppSelector(state => state.events)
    const [serviceProviderLoading, setServiceProviderLoading] = useState<boolean>(false)
    const [mergingLoading, setMergingLoading] = useState<boolean>(false)
    const [skillSet, setSkillSet] = useState<{ value: number, label: string }[]>([]);
    const [loadSkills, setLoadSkills] = useState<boolean>(false);
    const oldEvents = useMemo(() => {
        return events.filter(eventInfo => {
            const date1 = moment(eventInfo.end_date.join('-'))
            const presentDate = moment()
            const daysDiff = presentDate.diff(date1, 'days')
            return daysDiff > 0 || eventInfo.status === 'COMPLETED';
        })
    }, [events])
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (selectedEvent && !isEmpty(selectedEvent.start_date) && !isEmpty(selectedEvent.end_date)) {
            getAllServiceProvidersWithAvailability(moment(selectedEvent.start_date.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD'), moment(selectedEvent.end_date.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD'), setServiceProviderLoading).then(null)
        }
    }, [selectedEvent])

    useEffect(() => {
        dispatch(saveSkill(skillSet.map(value => ({id: value.value, name: value.label}))))
    }, [skillSet]);

    useEffect(() => {
        getAllSkills(setLoadSkills, setSkillSet).then(null)
    }, []);

    useEffect(() => {
        setSelectedEventInvoice([defaultEventData])
        resetInvoices()
        getAllJobs(setEventsLoading).then(null)
    }, []);

    useEffect(() => {
        const allJobs: IEvent[] = []
        invoice?.mergedInvoices.forEach(value => {
            allJobs.push(value.job)
        })
        if (!isEmpty(allJobs)) {
            setSelectedEventInvoice(prevState => [...prevState, ...allJobs])
        }
    }, [invoice]);

    const mergeInvoices = useCallback(async () => {
        setMergingLoading(true)
        await mergeInvoiceAction(selectedEventInvoice[0].id, selectedEventInvoice.map(value => value.id), setMergingLoading)
    }, [selectedEventInvoice])

    const eventInfoPendingText = useCallback((e: IEvent): string => {
        if (e.reviewed_by_client) {
            const SPKeys = Object.keys(e.reviewed_by_service_provider)
            SPKeys.forEach(key => {
                if (!e.reviewed_by_service_provider[key]) {
                    return 'Formulier freelancer'
                }
            })
        } else {
            return `Missing ${e.client?.first_name} ${e.client?.last_name}`
        }
        return ''
    }, [])

    return (
        <HStackComponent className={'h-[87vh]'}>
            <div className={'h-full relative flex flex-col overflow-auto border rounded p-4 w-full md:w-[30%] gap-2'}>
                <HStackComponent className={"justify-between"}>
                    <h1 className={"text-xl font-bold"}>Evenementen</h1>
                    {selectedEventInvoice.length > 1 && <Button onClick={mergeInvoices} variant={"outline"} className={"text-blue-600 h-8 border-blue-600 w-20"}>{mergingLoading ? 'Loading' : 'Merge'}</Button>}
                </HStackComponent>
                {eventsLoading && (
                    <VStackComponent className={'h-full'}>
                        <IconsComponent.spinner className="mr-2 h-6 w-6 animate-spin"/>
                        <p className={'text-base'}>Loading Evenementen</p>
                    </VStackComponent>
                )}
                {!eventsLoading && oldEvents.map((list, key) => (
                    <HStackComponent className={'gap-2 !flex-row w-full'} key={key}>
                        <ViewEventModalComponent
                        // eventInfoPendingText={() => {
                        //     // return eventInfoPendingText(list)
                        //     return ''
                        // }}
                        isSelected={Boolean(selectedEventInvoice.find(value => value.id === list.id)) || Boolean(invoice?.mergedInvoices.find(value => value.job.id === list.id))} loadSkills={loadSkills} skillSet={skillSet} selectEvent={list} index={key} serviceProviderLoading={serviceProviderLoading} setServiceProviderLoading={setServiceProviderLoading}/>
                        <Button variant={'outline'} className={`h-full ${(Boolean(selectedEventInvoice.find(value => value.id === list.id)) || Boolean(invoice?.mergedInvoices.find(value => value.job.id === list.id)))? 'border-green-700 border' : ''}`} onClick={(e) => {
                            if (e.shiftKey) {
                                setSelectedEventInvoice(prevState => [...prevState.filter(value => value.id !== 0), list])
                            } else {
                                setFirstSelectedEventInvoice(list)
                                setSelectedEventInvoice([list])
                            }
                        }}>
                            <PiInvoiceDuotone className={"w-5 h-5"}/>
                        </Button>
                    </HStackComponent>
                ))}
                {!eventsLoading && isEmpty(oldEvents) && (
                    <EmptyComponent text={'Geen evenementen gevonden!'} className={'h-full'}/>
                )}
            </div>
            <InvoiceTableComponent completeInvoice={invoice} selectedEvent={firstSelectedEventInvoice}/>
        </HStackComponent>
    );
};

export default Invoices;
