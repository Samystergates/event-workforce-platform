"use client"
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Calendar, momentLocalizer, SlotInfo, Views} from 'react-big-calendar';
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import {
    getAllJobs, getAllServiceProvidersAnyStatus,
    getAllServiceProvidersWithAvailability,
    getClientsJobs,
    getServiceProvidersJobs,
    setSelectedEvent
} from "@/redux/actions";
import {IconsComponent} from "@/components/common/icons.component";
import VStackComponent from "@/components/common/vertical-stack.component";
import ViewEventModalComponent from "@/app/(protected)/dashboard/components/view-event-modal.component";
import {useSession} from "next-auth/react";
import {isEmpty} from "lodash";
import EmptyComponent from "@/components/common/empty.component";
import {IEvent} from "@/interfaces/event.interfaces";
import {getDatesBetween} from "@/util/common";
import CommonDialogComponent from "@/components/common/common-dialog.component";
import SaveSelectedDatesModal from "@/app/(protected)/dashboard/components/save-selected-dates.modal";
import {saveSkill} from "@/redux/reducers/skillReducers";
import {getAllSkills} from "@/redux/actions/skillActions";


moment.locale('ko', {
    week: {
        dow: 1,
        doy: 1,
    },
});
const localizer = momentLocalizer(moment)

const CalenderViewComponent = () => {
        const openDialogBtnRef = useRef<HTMLButtonElement>()
        const {data: session} = useSession()
        const [view, setView] = useState<any>(Views.MONTH);
        const [date, setDate] = useState(new Date());
        const [selectionRange, setSelectionRange] = useState({startDate: new Date(), endDate: new Date()})
        const [pendingOpenEventId, setPendingOpenEventId] = useState<number | null>(null);
        const handleClearPendingOpen = useCallback(() => setPendingOpenEventId(null), []);
        const [eventsLoading, setEventsLoading] = useState<boolean>(true);
        const [skillSet, setSkillSet] = useState<{ value: number, label: string }[]>([]);
        const [loadSkills, setLoadSkills] = useState<boolean>(false);
        const [serviceProviderLoading, setServiceProviderLoading] = useState<boolean>(false)
        const [selectOption, setSelectOption] = useState('')
        const {selectedServiceProviders} = useAppSelector(state => state.skills);
        const {events, selectedEvent} = useAppSelector(state => state.events)
        const defaultDate = useMemo(() => new Date(), []);
        const dispatch = useAppDispatch()

        const toStartDate = (event: IEvent) => new Date(
            event.start_date[0],
            event.start_date[1] - 1,
            event.start_date[2],
            event.start_time?.[0] ?? 0,
            event.start_time?.[1] ?? 0,
            event.start_time?.[2] ?? 0
        );

        const sortedEvents = useMemo(() => {
            return [...events].sort((a, b) => toStartDate(a).getTime() - toStartDate(b).getTime());
        }, [events]);

        const availabilitySpecialDay = useMemo(() => selectedServiceProviders?.availability_dates?.map(dates => new Date(Number(dates.split('-')[0]), Number(dates.split('-')[1]) - 1, Number(dates.split('-')[2]))) || [], [selectedServiceProviders])
        const unavailableSpecialDay = useMemo(() => selectedServiceProviders?.unavailability_dates?.map(dates => new Date(Number(dates.split('-')[0]), Number(dates.split('-')[1]) - 1, Number(dates.split('-')[2]))) || [], [selectedServiceProviders])
        const unknownSpecialDay = useMemo(() => selectedServiceProviders?.unknown_dates?.map(dates => new Date(Number(dates.split('-')[0]), Number(dates.split('-')[1]) - 1, Number(dates.split('-')[2]))) || [], [selectedServiceProviders])

        const dayPropGetter = (date: { getDate: () => number; getMonth: () => number; getFullYear: () => number; }) => {
            if (session) {
                const {user} = session
                if (user.depId === 3) {
                    const isAvailableDay = availabilitySpecialDay.some(
                        (specialDate) =>
                            date.getDate() === specialDate.getDate() &&
                            date.getMonth() === specialDate.getMonth() &&
                            date.getFullYear() === specialDate.getFullYear()
                    );

                    if (isAvailableDay) {
                        return {
                            style: {
                                backgroundColor: "rgba(106,255,89,0.5)", // Custom background color
                            },
                        };
                    }

                    const isUnAvailableDay = unavailableSpecialDay.some(
                        (specialDate) =>
                            date.getDate() === specialDate.getDate() &&
                            date.getMonth() === specialDate.getMonth() &&
                            date.getFullYear() === specialDate.getFullYear()
                    );

                    if (isUnAvailableDay) {
                        return {
                            style: {
                                backgroundColor: "rgba(255,89,89,0.5)", // Custom background color
                            },
                        };
                    }

                    const isUnknownDay = unknownSpecialDay.some(
                        (specialDate) =>
                            date.getDate() === specialDate.getDate() &&
                            date.getMonth() === specialDate.getMonth() &&
                            date.getFullYear() === specialDate.getFullYear()
                    );

                    if (isUnknownDay) {
                        return {
                            style: {
                                backgroundColor: "rgba(249,255,89,0.5)", // Custom background color
                            },
                        };
                    }
                }
            }
            return {};
        };

        useEffect(() => {
            if (selectedEvent && !isEmpty(selectedEvent.start_date) && !isEmpty(selectedEvent.end_date)) {
                getAllServiceProvidersAnyStatus(moment(selectedEvent.start_date.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD'), moment(selectedEvent.end_date.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD'), setServiceProviderLoading).then(null)
            }
        }, [selectedEvent])

        useEffect(() => {
            dispatch(saveSkill(skillSet.map(value => ({id: value.value, name: value.label}))))
        }, [skillSet]);

        useEffect(() => {
            getAllSkills(setLoadSkills, setSkillSet).then(null)
        }, []);

        useEffect(() => {
            if (session) {
                const {user} = session
                if (user.depId === 1) {
                    getClientsJobs(`${user.id}`, setEventsLoading).then(null)
                } else if (user.depId === 2) {
                    getAllJobs(setEventsLoading).then(null)
                } else {
                    getServiceProvidersJobs(`${user.id}`, setEventsLoading).then(null)
                }
            }
        }, []);

        const eventStyleGetter = (eventData: { id: string, title: string, start: Date, end: Date, bgColor: string }) => {
            const style = {
                backgroundColor: eventData.bgColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            };
            return {
                style: style
            }
        }

        const selectHandlerSlot = (selectedDate: SlotInfo) => {
            selectedDate.end.setDate(selectedDate.end.getDate() - 1)
            setSelectionRange({startDate: selectedDate.start, endDate: selectedDate.end})
            setSelectOption('')
            openDialogBtnRef.current?.click()
        }

        if (!session) return <></>;

        const {user} = session;

        return (
            <div className={"h-full md:h-[41em] flex flex-col md:flex-row gap-4"}>
                <div
                    className={'h-[25em] md:h-full flex flex-col overflow-auto border rounded p-4 w-full md:w-[30%] gap-2'}>
                    <h1 className={"text-xl font-bold"}>Evenementen</h1>
                    {eventsLoading && (
                        <VStackComponent className={'h-full'}>
                            <IconsComponent.spinner className="mr-2 h-6 w-6 animate-spin"/>
                            <p className={'text-base'}>Loading Evenementen</p>
                        </VStackComponent>
                    )}
                    {!eventsLoading && sortedEvents.map((list, key) => (
                        <ViewEventModalComponent loadSkills={loadSkills} skillSet={skillSet} selectEvent={list} key={list.id}
                                                 index={key}
                                                 serviceProviderLoading={serviceProviderLoading}
                                                 setServiceProviderLoading={setServiceProviderLoading}
                                                 isSelected={selectedEvent?.id === list.id}
                                                 requestOpen={pendingOpenEventId === list.id}
                                                 onRequestOpenHandled={handleClearPendingOpen}/>
                    ))}
                    {!eventsLoading && isEmpty(events) && (
                        <EmptyComponent text={'Geen evenementen gevonden!'} className={'h-full'}/>
                    )}
                </div>
                <div className={'h-[40em] md:h-[41em] w-full flex flex-col gap-4'}>
                    <Calendar
                        defaultDate={defaultDate}
                        events={sortedEvents.map(event => ({
                                id: event.id,
                                title: event.title,
                                start: new Date(event.start_date[0], event.start_date[1] - 1, event.start_date[2], event.start_time[0], event.start_time[1]),
                                end: new Date(event.end_date[0], event.end_date[1] - 1, event.end_date[2], event.end_time[0], event.end_time[1]),
                                bgColor: event?.status === 'WAITING' ? '#ca8a04' : event?.status === 'STARTED' ? '#052e16' : event?.status === 'ACCEPTED' ? '#1e3a8a' : event?.status === 'COMPLETED' ? '#000' : '#881337'
                            })
                        ) as any}
                        localizer={localizer}
                        showMultiDayTimes
                        step={60}
                        onSelectEvent={(event: {
                            id: string,
                            title: string,
                            start: Date,
                            end: Date,
                            bgColor: string
                        }) => {
                            const matchedEvent = sortedEvents.find(e => e.id === Number(event.id));
                            if (matchedEvent) {
                                setSelectedEvent(matchedEvent);
                                setPendingOpenEventId(matchedEvent.id);
                            }
                        }}
                        eventPropGetter={eventStyleGetter as any}
                        style={{width: '100%'}}
                        defaultView={view}
                        views={[Views.MONTH, Views.WEEK, Views.DAY]}
                        dayPropGetter={dayPropGetter}
                        date={date} // Include the date prop
                        view={view}
                        selectable={user.depId === 3}
                        onSelectSlot={selectHandlerSlot}
                        onView={(view) => setView(view)}
                        onNavigate={(date) => {
                            setDate(new Date(date));
                        }}
                    />
                </div>
                <CommonDialogComponent
                    triggerLabel={''}
                    contentClassName={'w-full md:max-w-[60%]'}
                    dialogTitle={selectOption === 'Availability' ? 'SPECIFY AVAILABILITY' : 'CREATE'}
                    triggerClassName={'hidden'}
                    dialogBody={<SaveSelectedDatesModal selectionRange={selectionRange} selectOption={selectOption}
                                                        setSelectOption={setSelectOption}/>}
                    buttonRef={openDialogBtnRef}
                />
            </div>
        );
    }
;

export default CalenderViewComponent;
