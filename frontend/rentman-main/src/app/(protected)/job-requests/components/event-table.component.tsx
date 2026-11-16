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
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button} from "@/components/ui/button";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import TableBackNextBtnComponent from "@/components/table/table-back-next-btn.component";
import {actionEvents, getRequestJobs} from "@/redux/actions";
import {useSession} from "next-auth/react";
import useAuthRequest from "@/lib/useAuthRequest";
import {IconsComponent} from "@/components/common/icons.component";
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
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [actionSelected, setActionSelected] = useState<number>(1);
    const {potentialEvents} = useAppSelector(state => state.events)
    const {data: session} = useSession()

    const handleAcceptReject = (action: number, job_id: number, eventInfo: IEvent) => {
        if (session) {
            setActionSelected(action)
            actionEvents(session.user.id, setActionLoading, job_id, action, eventInfo).then(null)
        }
    }

    const columns: ColumnDef<IEvent>[] = [
        {
            accessorKey: "creation_date",
            header: "Create Date",
            cell: ({row}) => {
                return (
                    <div className="capitalize">{moment((row.getValue("creation_date") as any).join('-')).format('DD-MM-YYYY')}</div>
                )
            },
        },
        {
            accessorKey: "title",
            header: () => <div className="text-center">Title</div>,
            cell: ({row}) => <div className={'text-center capitalize'}>{row.getValue("title")}</div>,
        },
        {
            accessorKey: "start_date",
            header: () => <div className="text-center">Start Date</div>,
            cell: ({row}) => <div
                className="text-center">{moment((row.getValue("start_date") as any).join('-')).format('DD-MM-YYYY')}</div>,
        },
        {
            accessorKey: "end_date",
            header: () => <div className={'text-center'}>End Date</div>,
            cell: ({row}) => <div className="text-center">{moment((row.getValue("end_date") as any).join('-')).format('DD-MM-YYYY')}</div>,
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
            id: "actions",
            header: () => <div className="text-center">{eventsDisplayType === 'pendingEvents' ? 'Action' : 'Description'}</div>,
            enableHiding: false,
            cell: ({row}) => {
                if (eventsDisplayType === 'pendingEvents') {
                    return (
                        <HStackComponent>
                            <Button className={'min-w-[6rem]'} onClick={() => handleAcceptReject(1, row.original.id, row.original)}>
                                {actionSelected === 1 && actionLoading ? <IconsComponent.spinner className="h-3 w-3 animate-spin"/> : 'Accept'}
                            </Button>
                            <Button className={'min-w-[6rem]'} variant={'outline'} onClick={() => handleAcceptReject(0, row.original.id, row.original)}>
                                {actionSelected === 0 && actionLoading ? <IconsComponent.spinner className="h-3 w-3 animate-spin"/> : 'Decline'}
                            </Button>
                        </HStackComponent>
                    )
                } else return <div className="text-start font-medium">{(row.original as IEvent).description}</div>
            },
        },
    ]

    const table = useReactTable({
        data: potentialEvents,
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
