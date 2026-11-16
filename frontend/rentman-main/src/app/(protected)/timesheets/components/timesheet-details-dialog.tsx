
"use client"
import React, { useState, useEffect } from 'react';
import { IPurchaseOrder, ITimesheetPunchMatch, PunchMatchStatus } from "@/interfaces/event.interfaces";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Trash2, Pencil, Save, AlertCircle, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import moment from "moment";

interface TimesheetDetailsDialogProps {
    timesheet: IPurchaseOrder;
    onToggleAttention?: (id: number) => void;
    onDelete?: (id: number) => void;
    onEdit?: (timesheet: IPurchaseOrder) => void;
    punchMatchStatus?: ITimesheetPunchMatch;
    canEdit?: boolean;
}

const TimesheetDetailsDialog: React.FC<TimesheetDetailsDialogProps> = ({
    timesheet,
    onToggleAttention,
    onDelete,
    onEdit,
    punchMatchStatus,
    canEdit = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedTimesheet, setEditedTimesheet] = useState(timesheet);

    const statusToColor: Record<PunchMatchStatus, string> = {
        match: 'text-green-500',
        mismatch: 'text-yellow-500',
        missing: 'text-red-500'
    };

    const startMatch = punchMatchStatus?.start.status ?? 'missing';
    const endMatch = punchMatchStatus?.end.status ?? 'missing';

    const formatTimeValue = (time: string | number[] | undefined): string => {
        if (!time) return '';
        if (Array.isArray(time)) {
            return `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}`;
        }
        if (typeof time === 'string' && time.includes(':')) {
            return time.slice(0, 5);
        }
        return time;
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        let value = e.target.value;
        value = value.replace(/[^\d:]/g, '');
        value = value.replace(/:/g, '');
        value = value.slice(0, 4);

        if (value.length >= 2) {
            const hours = parseInt(value.slice(0, 2));
            if (hours > 23) {
                value = '23' + value.slice(2);
            }
        }

        if (value.length > 2) {
            value = value.slice(0, 2) + ':' + value.slice(2);
        }

        if (value.length >= 5) {
            const minutes = value.slice(3, 5);
            if (parseInt(minutes) > 59) {
                value = value.slice(0, 3) + '59';
            }
        }

        setEditedTimesheet({ ...editedTimesheet, [field]: value });
    };

    // const timeStringToArray = (timeStr: string | number[] | undefined): number[] | null => {
    //     if (!timeStr) return null;
    //     if (Array.isArray(timeStr)) return timeStr;
    //     if (typeof timeStr === 'string' && timeStr.includes(':')) {
    //         const [hours, minutes] = timeStr.split(':').map(v => parseInt(v, 10));
    //         return [hours || 0, minutes || 0];
    //     }
    //     return null;
    // };


    const timeStringToArray = (timeStr: string | number[] | undefined): number[] | undefined => {
        if (!timeStr) return undefined;
        if (Array.isArray(timeStr)) return timeStr;
        if (typeof timeStr === 'string') {
            if (timeStr === '--:--' || timeStr === '') return undefined; // Handle empty display values
            if (timeStr.includes(':')) {
                const [hours, minutes] = timeStr.split(':').map(v => parseInt(v, 10));
                if (!isNaN(hours) && !isNaN(minutes)) {
                    return [hours, minutes];
                }
            }
        }
        return undefined;
    };

    useEffect(() => {
        setEditedTimesheet(timesheet);
    }, [timesheet]);

    const getStatusBadge = () => {
        const status = (timesheet.status || 'PENDING').toString().toUpperCase();
        switch (status) {
            case "APPROVED":
                return (
                    <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                        Goedgekeurd
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">
                        Afgekeurd
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-full">
                        In afwachting
                    </span>
                );
        }
    };

    return (
        <>
            <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(true);
                        setShowDropdown(false);
                    }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bewerken
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        onToggleAttention?.(timesheet.id);
                        setShowDropdown(false);
                    }}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        {timesheet.attention ? 'Aandacht Verwijderen' : 'Aandacht Markeren'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Timesheet Details</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Worker and Project Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Worker</p>
                                {/* <p className="mt-1 text-lg">
                                    {timesheet.serviceProvider.firstName} {timesheet.serviceProvider.lastName}
                                </p> */}
                                {/* {isEditMode ? (
                                    <Input value={`${editedTimesheet.serviceProvider.firstName} ${editedTimesheet.serviceProvider.lastName}`}
                                        onChange={(e) => {
                                            const [firstName, ...lastName] = e.target.value.split(' ');
                                            setEditedTimesheet({ ...editedTimesheet, serviceProvider: { ...editedTimesheet.serviceProvider, firstName, lastName: lastName.join(' ') } });
                                        }} />
                                ) : ( */}
                                <p className="mt-1 text-lg">{timesheet.serviceProvider.firstName} {timesheet.serviceProvider.lastName}</p>
                                {/* )} */}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Project</p>
                                <p className="mt-1 text-lg">
                                    {timesheet.job?.title || 'Geen project data'}
                                </p>
                            </div>
                        </div>

                        {/* Date and Status Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Datum</p>
                                <p className="mt-1 text-lg">
                                    {moment(timesheet.jobDate.join('-'), 'YYYY-MM-DD').format('DD MMM YYYY')}
                                </p>
                            </div>
                            <div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    {isEditMode ? (
                                        <Select
                                            value={editedTimesheet.status || 'PENDING'}
                                            onValueChange={(value) => setEditedTimesheet({ ...editedTimesheet, status: value })}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">In afwachting</SelectItem>
                                                <SelectItem value="APPROVED">Goedgekeurd</SelectItem>
                                                <SelectItem value="REJECTED">Afgekeurd</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="mt-1">
                                            {getStatusBadge()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hours and Overtime Row */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* <div>
                                <p className="text-sm font-medium text-gray-500">Uren gewerkt</p>
                                {isEditMode ? (
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editedTimesheet.workedtime || ''}
                                        onChange={(e) => setEditedTimesheet({ ...editedTimesheet, workedtime: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g., 8.5"
                                    />
                                ) : (
                                    <p className="mt-1 text-lg">{formatHours(timesheet.workedtime)}</p>
                                )}
                            </div> */}
                            {/* <div>
                                <p className="text-sm font-medium text-gray-500">Overuren</p>
                                {isEditMode ? (
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editedTimesheet.overtime || ''}
                                        onChange={(e) => setEditedTimesheet({ ...editedTimesheet, overtime: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g., 2.5"
                                    />
                                ) : (
                                    <p className="mt-1 text-lg">{formatHours(timesheet.overtime)}</p>
                                )}
                            </div> */}

                            <div>
                                <p className="text-sm font-medium text-gray-500">Start Time</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span
                                        title={punchMatchStatus?.start.punchTime ? `Punch: ${punchMatchStatus.start.punchTime}` : 'No punch recorded'}
                                    >
                                        <Clock
                                            className={`h-4 w-4 ${statusToColor[startMatch]}`}
                                        />
                                    </span>
                                    {isEditMode ? (
                                        <Input
                                            type="text"
                                            value={formatTimeValue(editedTimesheet.startTime)}
                                            onChange={(e) => handleTimeChange(e, 'startTime')}
                                            placeholder="HH:MM"
                                            maxLength={5}
                                        />
                                    ) : (
                                        <p className="text-lg">{formatTimeValue(timesheet.startTime) || '--:--'}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">End Time</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span
                                        title={punchMatchStatus?.end.punchTime ? `Punch: ${punchMatchStatus.end.punchTime}` : 'No punch recorded'}
                                    >
                                        <Clock
                                            className={`h-4 w-4 ${statusToColor[endMatch]}`}
                                        />
                                    </span>
                                    {isEditMode ? (
                                        <Input
                                            type="text"
                                            value={formatTimeValue(editedTimesheet.endTime)}
                                            onChange={(e) => handleTimeChange(e, 'endTime')}
                                            placeholder="HH:MM"
                                            maxLength={5}
                                        />
                                    ) : (
                                        <p className="text-lg">{formatTimeValue(timesheet.endTime) || '--:--'}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Break</p>
                                {isEditMode ? (
                                    <Input
                                        type="text"
                                        value={formatTimeValue(editedTimesheet.breakMinutes)}
                                        onChange={(e) => handleTimeChange(e, 'breakMinutes')}
                                        placeholder="HH:MM"
                                        maxLength={5}
                                    />
                                ) : (
                                    <p className="mt-1 text-lg">{formatTimeValue(timesheet.breakMinutes) || '--:--'}</p>
                                )}
                            </div>
                        </div>

                        {/* Kilometers and Break Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Kilometers</p>

                                {isEditMode ? (
                                    <Input
                                        type="text"
                                        value={editedTimesheet.kilometer === undefined || editedTimesheet.kilometer === null ? '' : editedTimesheet.kilometer}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow empty string, numbers, and decimal point
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                setEditedTimesheet({
                                                    ...editedTimesheet,
                                                    kilometer: value === '' ? undefined : value
                                                });
                                            }
                                        }}
                                        placeholder="0"
                                    />
                                ) : (
                                    <p className="mt-1 text-lg">{timesheet.kilometer !== undefined && timesheet.kilometer !== null ? `${timesheet.kilometer} km` : '--'}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Extra Kosten</p>
                                {isEditMode ? (
                                    <Input
                                        type="text"
                                        value={editedTimesheet.extraCost === undefined || editedTimesheet.extraCost === null ? '' : editedTimesheet.extraCost}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow empty string, numbers, and decimal point
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                setEditedTimesheet({
                                                    ...editedTimesheet,
                                                    extraCost: value === '' ? undefined : value
                                                });
                                            }
                                        }}
                                        placeholder="0.00"
                                    />
                                ) : (
                                    <p className="mt-1 text-lg">{timesheet.extraCost !== undefined && timesheet.extraCost !== null ? `€ ${timesheet.extraCost}` : '--'}</p>
                                )}
                            </div>
                            {/* <div>
                                <p className="text-sm font-medium text-gray-500">Reistijd</p>
                                {isEditMode ? (
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editedTimesheet.traveltime || ''}
                                        onChange={(e) => setEditedTimesheet({ ...editedTimesheet, traveltime: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g., 1.5"
                                    />
                                ) : (
                                    <p className="mt-1 text-lg">{formatHours(timesheet.traveltime)}</p>
                                )}

                            </div> */}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500">Opmerkingen worker</p>
                            {/* <div className="mt-2 p-4 bg-gray-50 rounded-md min-h-[80px]"> */}
                            {/* <p className="text-base">{timesheet.invoiceDescription || timesheet.extraCostDescription}</p> */}
                            {isEditMode ? (
                                <Textarea
                                    className="mt-2 min-h-[80px]"
                                    value={editedTimesheet.extraCostDescription || ''}
                                    onChange={(e) => setEditedTimesheet({ ...editedTimesheet, extraCostDescription: e.target.value })}
                                    placeholder="Voeg opmerkingen toe..."
                                />
                            ) : (
                                <div className="mt-2 p-4 bg-gray-50 rounded-md min-h-[80px]">
                                    <p className="text-base">{timesheet.extraCostDescription}</p>
                                </div>
                            )}
                        </div>
                        {/* </div> */}

                        <div className="flex gap-2 pt-4 border-t">
                            {/* <Button
                                variant="outline"
                                onClick={() => {
                                    onToggleAttention?.(timesheet.id);
                                    setIsOpen(false);
                                }}
                                className="flex-1"
                            >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                {timesheet.attention ? 'Verwijder Aandacht' : 'Markeer voor Aandacht'}
                            </Button> */}
                            <Button
                                variant="outline"
                                disabled={!canEdit}
                                title={!canEdit ? 'Timesheets kunnen pas worden bewerkt wanneer de jobstatus COMPLETED is.' : undefined}
                                onClick={async () => {
                                    if (!canEdit) {
                                        return;
                                    }

                                    if (isEditMode) {
                                        // Validate status
                                        let validStatus = (editedTimesheet.status || timesheet.status || 'PENDING').toString().toUpperCase();
                                        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(validStatus)) {
                                            validStatus = 'PENDING';
                                        }

                                        // Preserve all original fields and only update edited ones
                                        const timesheetToSave = {
                                            ...timesheet,
                                            status: validStatus,
                                            // start_time: timeStringToArray(editedTimesheet.startTime) || timeStringToArray(timesheet.startTime) || [0, 0],
                                            // end_time: timeStringToArray(editedTimesheet.endTime) || timeStringToArray(timesheet.endTime) || [0, 0],
                                            // break_minutes: timeStringToArray(editedTimesheet.breakMinutes) || timeStringToArray(timesheet.breakMinutes) || [0, 0],
                                            startTime: timeStringToArray(editedTimesheet.startTime) || timeStringToArray(timesheet.startTime) || [0, 0],
                                            endTime: timeStringToArray(editedTimesheet.endTime) || timeStringToArray(timesheet.endTime) || [0, 0],
                                            breakMinutes: timeStringToArray(editedTimesheet.breakMinutes) || timeStringToArray(timesheet.breakMinutes) || [0, 0],
                                            kilometer: editedTimesheet.kilometer !== undefined ? (editedTimesheet.kilometer === '' ? undefined : parseFloat(editedTimesheet.kilometer)) : timesheet.kilometer,
                                            extraCost: editedTimesheet.extraCost !== undefined ? (editedTimesheet.extraCost === '' ? undefined : parseFloat(editedTimesheet.extraCost)) : timesheet.extraCost,
                                            extraCostDescription: editedTimesheet.extraCostDescription || timesheet.extraCostDescription || '',
                                            invoiceDescription: editedTimesheet.invoiceDescription || editedTimesheet.extraCostDescription || timesheet.invoiceDescription || '',
                                            attention: timesheet.attention
                                        };

                                        const success = await onEdit?.(timesheetToSave);
                                        if (success) {
                                            // setEditedTimesheet({
                                            //     ...editedTimesheet,
                                            //     startTime: timesheetToSave.start_time,
                                            //     endTime: timesheetToSave.end_time,
                                            //     breakMinutes: timesheetToSave.break_minutes
                                            // });
                                            setEditedTimesheet(editedTimesheet);
                                            setIsEditMode(false);
                                        }
                                    } else {
                                        setIsEditMode(true);
                                    }
                                }}
                                className="flex-1"
                            >
                                {isEditMode ? (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Wijzigingen Opslaan
                                    </>
                                ) : (
                                    <>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Bewerken
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (confirm('Weet je zeker dat je deze timesheet wilt verwijderen?')) {
                                        onDelete?.(timesheet.id);
                                        setIsOpen(false);
                                    }
                                }}
                                className="flex-1"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Verwijderen
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    );
};

export default TimesheetDetailsDialog;
