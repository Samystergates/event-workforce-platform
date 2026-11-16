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
import {useAppSelector} from "@/redux/hooks";
import TableBackNextBtnComponent from "@/components/table/table-back-next-btn.component";
import {useSession} from "next-auth/react";
import {isEmpty, isNil} from "lodash";
import AssignServiceProviderDropdown from "@/app/(protected)/assign-job/components/assign-service-provider-dropdown";
import useAuthRequest from "@/lib/useAuthRequest";
import {IUserProfile} from "@/interfaces/user.interfaces";
import {Badge} from "@/components/ui/badge";

type componentPropType = {
    eventsLoading: boolean;
    setEventsLoading: React.Dispatch<React.SetStateAction<boolean>>
    eventsDisplayType: string
}

const EventTableComponent = ({eventsLoading, setEventsLoading, eventsDisplayType}: componentPropType) => {
    useAuthRequest()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const {events} = useAppSelector(state => state.events)
    const {serviceProviders} = useAppSelector(state => state.user)
    const [tableValues, setTableValues] = useState<IEvent[]>(events.filter(eventValue => isNil(eventValue.service_providers_list)));
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
            header: () => <div className="text-center">Titel</div>,
            cell: ({row}) => <div className={'text-center capitalize'}>{row.getValue("title")}</div>,
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
            cell: ({row}) => <div className="text-center">{moment((row.getValue("start_date") as any).join("-"), "YYYY-MM-DD").format('DD-MM-YYYY')}</div>,
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
            accessorKey: "description",
            header: () => <div className={'text-center'}>Beschrijving</div>,
            cell: ({row}) => <div className="text-start font-medium">{row.getValue("description")}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-center"></div>,
            enableHiding: false,
            cell: ({row}) => {
                const selectedOption = (row.original as IEvent).potential_service_providers.filter(value => {
                    if (session && session.user.depId === 1) return value.accepted === 1
                    else return value
                }).map(provider => {
                        const findServiceProvider: IUserProfile | undefined = serviceProviders.find(provider1 => provider1.id === provider.service_provider_id)
                        return ({
                            value: provider.service_provider_id,
                            label: findServiceProvider ? `${findServiceProvider.first_name} ${findServiceProvider.last_name}` : 'Name not found.'
                        })
                    }
                )
                return (
                    <AssignServiceProviderDropdown selectedOption={selectedOption}/>
                )
            },
        },
    ]

    useEffect(() => {
        if (eventsDisplayType === 'pendingEvents') {
            setTableValues(events.filter(eventValue => isEmpty(eventValue.service_providers_list) || eventValue.service_providers_list.length !== eventValue.number_of_people))
        } else if (eventsDisplayType === 'assignedEvents') {
            setTableValues(events.filter(eventValue => !isEmpty(eventValue.service_providers_list) && eventValue.service_providers_list.length === eventValue.number_of_people).map(value => ({...value, status: 'STARTED'})))
        } else {
            setTableValues(events.map(value => ({...value, status: value.service_providers_list.length === value.number_of_people ? 'STARTED' : value.status})))
        }
    }, [events, eventsDisplayType]);

    const table = useReactTable({
        data: tableValues,
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

    return (
        <>
            <ThemeTableComponent loading={eventsLoading} table={table} columns={columns} className={'mt-5'}/>
            <TableBackNextBtnComponent table={table}/>
        </>
    );
};

export default EventTableComponent;
