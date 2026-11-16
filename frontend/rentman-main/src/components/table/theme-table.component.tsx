import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {flexRender} from "@tanstack/react-table"
import {IconsComponent} from "@/components/common/icons.component";
import HStackComponent from "@/components/common/horizontal-stack.component";

type componentPropType = {
    table: any;
    columns: any;
    loading?: boolean;
    className?: string
}

const ThemeTableComponent = ({table, columns, className, loading}: componentPropType) => {
    return (
        <div className={`rounded-md border min-h-[44rem] ${className && className}`}>
            <Table className="relative">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup: any) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header: any) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className={`${loading || !table.getRowModel().rows?.length ? 'h-[44rem]' : 'border-b h-auto'}`}>
                    {loading ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="min-h-[44rem] text-center"
                            >
                                <HStackComponent className={'gap-2'}><p className={'text-base'}>Laden</p> <IconsComponent.spinner className="mr-2 h-5 w-5 animate-spin"/></HStackComponent>
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row: any) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell: any) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-[44rem] text-center"
                            >
                                Geen resultaten gevonden.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ThemeTableComponent;
