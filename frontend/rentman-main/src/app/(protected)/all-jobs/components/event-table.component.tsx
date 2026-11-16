"use client"
import React, {useEffect, useState} from 'react';
import ThemeTableComponent from "@/components/table/theme-table.component";
import {IEvent} from "@/interfaces/event.interfaces";
import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState
} from "@tanstack/react-table"
import moment from "moment";
import { formatTimeArrayForInput, formatTimeArrayToString } from "@/util/common";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button} from "@/components/ui/button";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import TableBackNextBtnComponent from "@/components/table/table-back-next-btn.component";
import {actionEvents, getAllServiceProviders, getRequestJobs} from "@/redux/actions";
import {useSession} from "next-auth/react";
import useAuthRequest from "@/lib/useAuthRequest";
import {IconsComponent} from "@/components/common/icons.component";
import { Badge } from "@/components/ui/badge"
import ActionBtnComponent from "@/app/(protected)/all-jobs/components/action-btn.component";
import AcceptForServiceProvider from "@/app/(protected)/all-jobs/components/accept-for-service-provider.component";
import {IUserProfile} from "@/interfaces/user.interfaces";
import AssignServiceProviderDropdown from "@/app/(protected)/assign-job/components/assign-service-provider-dropdown";

type componentPropType = {
    eventsLoading: boolean;
    setEventsLoading: React.Dispatch<React.SetStateAction<boolean>>
    eventsDisplayType: string
}

const renderEventTime = (time: unknown): string => {
    if (Array.isArray(time)) {
        const normalized = formatTimeArrayToString(time as Array<number | string>);
        const fallback = formatTimeArrayForInput(time as Array<number | string>);

        if (normalized) {
            const parsed = moment(normalized, "HH:mm:ss", true);
            if (parsed.isValid()) {
                return parsed.format("HH:mm");
            }
        }

        return fallback || (normalized ? normalized.slice(0, 5) : "-");
    }

    if (typeof time === "string") {
        const trimmed = time.trim();
        if (!trimmed) {
            return "-";
        }

        const pattern = trimmed.split(":").length > 2 ? "HH:mm:ss" : "HH:mm";
        const parsed = moment(trimmed, pattern, true);
        if (parsed.isValid()) {
            return parsed.format("HH:mm");
        }

        if (trimmed.includes(":")) {
            const [hours = "00", minutes = "00"] = trimmed.split(":");
            return [hours.padStart(2, "0"), minutes.padStart(2, "0")].join(":");
        }

        return trimmed;
    }

    return "-";
};

const EventTableComponent = ({eventsLoading, setEventsLoading, eventsDisplayType}: componentPropType) => {
    useAuthRequest()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const {events} = useAppSelector(state => state.events)
    const {data: session} = useSession()

    const columns: ColumnDef<IEvent>[] = [
        {
            accessorKey: "creation_date",
            header: "Datum aanmaken",
            cell: ({row}) => {
                return (
                    <div className="capitalize">{moment((row.getValue("creation_date") as any).join("-"), "YYYY-MM-DD").format('DD-MM-YYYY')}</div>
                )
            },
        },
        {
            accessorKey: "title",
            header: () => <div className="text-center">Title</div>,
            cell: ({row}) => <div className={'text-start capitalize min-w-48'}>{row.getValue("title")}</div>,
        },
        {
            accessorKey: "start_date",
            header: () => <div className="text-center">Startdatum</div>,
            cell: ({row}) => <div
                className="text-center">{moment((row.getValue("start_date") as any).join("-"), "YYYY-MM-DD").format('DD-MM-YYYY')}</div>,
        },
        {
            accessorKey: "end_date",
            header: () => <div className={'text-center'}>Einddatum</div>,
            cell: ({row}) => <div className="text-center">{moment((row.getValue("end_date") as any).join("-"), "YYYY-MM-DD").format('DD-MM-YYYY')}</div>,
        },
        {
            accessorKey: "start_time",
            header: () => <div className="text-center">Begintijd</div>,
            cell: ({row}) => <div
                className="text-center">{renderEventTime(row.getValue("start_time"))}</div>,
        },
        {
            accessorKey: "end_time",
            header: () => <div className={'text-center'}>Eindtijd</div>,
            cell: ({row}) => <div className="text-center">{renderEventTime(row.getValue("end_time"))}</div>,
        },
        {
            accessorKey: "status",
            header: () => <div className={'text-center'}>Status</div>,
            cell: ({row}) => {
                const bgColor = row.getValue("status") === 'WAITING' ? 'bg-yellow-600' : row.getValue("status") === 'STARTED' ? 'bg-green-900' : row.getValue("status") === 'ACCEPTED' ? 'bg-blue-900' : row.getValue("status") === 'COMPLETED' ? '' : 'bg-red-900'

                return (
                    <div className={'flex items-center justify-center'}>
                        <Badge variant={"default"} className={bgColor}>{(row.getValue("status") as any)?.replace('_', ' ')}</Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "client",
            header: () => <div className={'text-center'}>Klantnaam</div>,
            cell: ({row}) => <div className={"text-start break-all"}>{(row.getValue("client") as any).first_name} {(row.getValue("client") as any).last_name}</div>,
        },
        {
            id: "service_provider_list",
            header: () => <div className="text-center">Freelancers accepteerden de baan</div>,
            enableHiding: false,
            cell: ({row}) => {
                const selectedOption = (row.original as IEvent).service_providers_list.map(provider => ({
                        value: provider.id,
                        label: (provider?.first_name && provider?.last_name) ? `${provider?.first_name} ${provider?.last_name}` : 'Name not found.'
                    })
                )
                return (
                    <AssignServiceProviderDropdown selectedOption={selectedOption}/>
                )
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">{eventsDisplayType === 'pendingEvents' ? 'Actie' : 'Beschrijving'}</div>,
            enableHiding: false,
            cell: ({row}) => {
                if (eventsDisplayType === 'pendingEvents') {
                    return <ActionBtnComponent eventInfo={row.original as IEvent}/>
                } else if (eventsDisplayType === 'acceptedEvents') {
                    return <AcceptForServiceProvider eventInfo={row.original as IEvent}/>
                } else return <div className="text-start font-medium min-w-[20rem] max-w-[20rem]">{(row.original as IEvent).description}</div>
            },
        },
    ]

    const table = useReactTable({
        data: events,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    useEffect(() => {
        if (session) {
            const {user} = session
            getAllServiceProviders().then(null)
            getRequestJobs(`${user.id}`, setEventsLoading, eventsDisplayType).then(null)
        }
    }, [session, eventsDisplayType]);


    return (
        <>
            <ThemeTableComponent loading={eventsLoading} table={table} columns={columns} className={'mt-5'}/>
            <TableBackNextBtnComponent table={table}/>
        </>
    );
};

export default EventTableComponent;
