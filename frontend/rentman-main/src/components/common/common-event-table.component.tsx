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
import TableBackNextBtnComponent from "@/components/table/table-back-next-btn.component";
import {getRequestJobs} from "@/redux/actions";
import {useSession} from "next-auth/react";

type componentPropType = {
    eventsLoading: boolean;
    setEventsLoading: React.Dispatch<React.SetStateAction<boolean>>
    events: IEvent[]
}

const CommonEventTableComponent = ({eventsLoading, setEventsLoading, events}: componentPropType) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const columns: ColumnDef<IEvent>[] = [
        {
            accessorKey: "creation_date",
            header: "Create Date",
            cell: ({row}) => {
                return (
                    <div className="capitalize">{moment((row.getValue("creation_date") as any).join("-"), "YYYY-MM-DD").format('DD-MM-YYYY')}</div>
                )
            },
        },
        {
            accessorKey: "title",
            header: () => <div className="text-center">Title</div>,
            cell: ({row}) => <div className={'text-center capitalize'}>{row.getValue("title")}</div>,
        },
        {
            accessorKey: "payment",
            header: () => <div className="text-center">Amount ($)</div>,
            cell: ({row}) => {
                const amount = parseFloat(row.getValue("payment"))
                return <div className="text-center font-medium">{amount}</div>
            },
        },
        {
            accessorKey: "description",
            header: () => <div className="text-center">Description</div>,
            cell: ({row}) => <div className="text-center font-medium">{row.getValue("description")}</div>,
        },
        {
            accessorKey: "start_date",
            header: () => <div className="text-center">Start Date</div>,
            cell: ({row}) => <div
                className="text-center">{moment((row.getValue("start_date") as any).join("-"), "YYYY-MM-DD").format('DD-MM-YYYY')}</div>,
        },
        {
            accessorKey: "end_date",
            header: () => <div className={'text-center'}>End Date</div>,
            cell: ({row}) => <div className="text-center">{moment((row.getValue("start_date") as any).join("-"), "YYYY-MM-DD").format('DD-MM-YYYY')}</div>,
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

    return (
        <>
            <ThemeTableComponent loading={eventsLoading} table={table} columns={columns} className={'mt-5'}/>
            <TableBackNextBtnComponent table={table}/>
        </>
    );
};

export default CommonEventTableComponent;
