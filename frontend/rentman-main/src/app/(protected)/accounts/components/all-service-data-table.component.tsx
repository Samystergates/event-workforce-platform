import React, { useEffect, useState } from 'react';
import ThemeTableComponent from "@/components/table/theme-table.component";
import TableBackNextBtnComponent from "@/components/table/table-back-next-btn.component";
import useAuthRequest from "@/lib/useAuthRequest";
import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState
} from "@tanstack/react-table";
import { useAppSelector } from "@/redux/hooks";
import { IEvent } from "@/interfaces/event.interfaces";
import { isEmpty, isNil } from "lodash";
import { useSession } from "next-auth/react";
import moment from "moment/moment";
import { Badge } from "@/components/ui/badge";
import { IUserProfile } from "@/interfaces/user.interfaces";
import AssignServiceProviderDropdown from "@/app/(protected)/assign-job/components/assign-service-provider-dropdown";
import ServiceProviderProfileViewModal
    from "@/app/(protected)/dashboard/components/service-provider-profile-view.modal";
import CommonServiceProviderViewComponent from "@/components/profile/common-service-provider-view.component";
import CommonDialogComponent from "@/components/common/common-dialog.component";
import DeleteServiceProviderComponent from "@/app/(protected)/accounts/components/delete-service-provider.component";

const AllServiceDataTable = ({ serviceProviderLoading, userStatus, searchQuery, handleRefresh }: { serviceProviderLoading: boolean, userStatus: string, searchQuery?: string, handleRefresh: () => void }) => {
    const { availableServiceProviders, unAvailableServiceProviders, unknownServiceProviders, maybeServiceProviders } = useAppSelector(state => state.user)
    const [spData, setSpData] = useState<IUserProfile[]>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const { data: session } = useSession()

    const columns: ColumnDef<IUserProfile>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => {
                return (
                    <div className="capitalize">{row.getValue("id")}</div>
                )
            },
        },
        {
            accessorKey: "first_name",
            header: "Naam",
            cell: ({ row }) => <div className={'capitalize'}>{row.getValue("first_name")} {row.original.last_name ?? ''}</div>,
        },
        {
            accessorKey: "contact",
            header: "Contact",
            cell: ({ row }) => <div>{row.getValue("contact")}</div>,
        },
        {
            accessorKey: "availability_start_date",
            header: "Beschikbaarheid",
            cell: ({ row }) => <div className={"w-48"}>
                {row.original?.availability_dates
                    ? moment(new Date(row.original?.availability_dates[0] ?? ''))
                        .format('DD, MMM YYYY')
                    : moment(new Date()).format('DD, MMM YYYY')
                } {" - "} {row.original?.availability_dates
                    ? moment(new Date(row.original?.availability_dates[row.original?.availability_dates?.length - 1] ?? ''))
                        .format('DD, MMM YYYY')
                    : moment(new Date()).format('DD, MMM YYYY')
                }
            </div>,
        },
        // {
        //     accessorKey: "status",
        //     header: () => <div className={'text-center'}>Status</div>,
        //     cell: ({row}) => {
        //         const displayValue = row.original.status === 'Available' ?
        //             {bgColor: 'bg-green-900', status: 'Beschikbaar'}
        //             : row.original.status === 'Maybe' ?
        //                 {bgColor: 'bg-blue-900', status: 'Misschien'}
        //                 : row.original.status === 'Unknown' ?
        //                     {bgColor: 'bg-yellow-600', status: 'Onbekend'}
        //                     : {bgColor: 'bg-black', status: 'Niet beschikbaar'}
        //         return (
        //             <div className={'flex items-center justify-center w-32'}>
        //                 <Badge variant={"default"}
        //                        className={displayValue.bgColor}>{displayValue.status}</Badge>
        //             </div>
        //         )
        //     },
        // },
        {
            accessorKey: "status",
            header: () => <div className={'text-left'}>Status</div>,
            cell: ({ row }) => {
                const displayValue = row.original.status === 'Available' ?
                    { bgColor: 'bg-green-900', status: 'Beschikbaar' }
                    : row.original.status === 'Maybe' ?
                        { bgColor: 'bg-blue-900', status: 'Misschien' }
                        : row.original.status === 'Unknown' ?
                            { bgColor: 'bg-yellow-600', status: 'Onbekend' }
                            : { bgColor: 'bg-black', status: 'Niet beschikbaar' }
                return (
                    <div className={'flex items-center justify-start'}>
                        <Badge variant={"default"}
                            className={displayValue.bgColor}>{displayValue.status}</Badge>
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: () => <div></div>,
            enableHiding: false,
            cell: ({ row }) => (
                <div className={"flex flex-row gap-4"}>
                    <CommonDialogComponent
                        triggerLabel={'Bekijk profiel'}
                        triggerClassName={'w-fit self-end'}
                        dialogTitle={`${row.original.first_name} ${row.original.last_name ?? ''}`}
                        contentClassName={'w-11/12 md:max-w-[55%]'}
                        dialogBody={
                            <div>
                                <div className={'bg-gray-200 rounded w-full h-[2px] !mb-5'} />
                                <CommonServiceProviderViewComponent userId={`${row.original.id}`} disabled={session?.user?.depId !== 2} />
                            </div>
                        }
                    />
                    <DeleteServiceProviderComponent serviceProvider={row.original} handleRefresh={handleRefresh} />
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data: spData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        initialState: {  // Add this
            pagination: {
                pageSize: 50,  // Show 50 entries per page (you can adjust this number)
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    useEffect(() => {
        let filteredData: IUserProfile[] = [];

        // First filter by status
        if (userStatus === 'allUser') {
            filteredData = [...availableServiceProviders, ...unAvailableServiceProviders, ...unknownServiceProviders, ...maybeServiceProviders]
        } else if (userStatus === 'available') {
            filteredData = availableServiceProviders
        } else if (userStatus === 'unAvailable') {
            filteredData = unAvailableServiceProviders
        } else if (userStatus === 'maybe') {
            filteredData = maybeServiceProviders
        } else if (userStatus === 'unknown') {
            filteredData = unknownServiceProviders
        }

        // Then filter by search query
        if (searchQuery && searchQuery.trim() !== '') {
            filteredData = filteredData.filter(sp => {
                const fullName = `${sp.first_name || ''} ${sp.last_name || ''}`.toLowerCase();
                return fullName.includes(searchQuery.toLowerCase());
            });
        }

        setSpData(filteredData);
    }, [userStatus, searchQuery, availableServiceProviders, unAvailableServiceProviders, unknownServiceProviders, maybeServiceProviders]);

    // useEffect(() => {
    //     if (userStatus === 'allUser') {
    //         setSpData([...availableServiceProviders,...unAvailableServiceProviders,...unknownServiceProviders,...maybeServiceProviders])
    //     } else if (userStatus === 'available') {
    //         setSpData(availableServiceProviders)
    //     } else if (userStatus === 'unAvailable') {
    //         setSpData(unAvailableServiceProviders)
    //     } else if (userStatus === 'maybe') {
    //         setSpData(maybeServiceProviders)
    //     } else if (userStatus === 'unknown') {
    //         setSpData(unknownServiceProviders)
    //     }

    // }, [userStatus, availableServiceProviders, unAvailableServiceProviders, unknownServiceProviders, maybeServiceProviders]);

    return (
        <>
            <ThemeTableComponent loading={serviceProviderLoading} table={table} columns={columns} className={'mt-5'} />
            <TableBackNextBtnComponent table={table} />
        </>
    );
};

export default AllServiceDataTable;
