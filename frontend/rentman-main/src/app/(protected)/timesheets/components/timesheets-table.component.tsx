"use client"
import React, { useMemo, useState } from 'react';
import { IPurchaseOrder, IPunchDetail, ITimesheetPunchMatch, PunchMatchStatus } from "@/interfaces/event.interfaces";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, AlertCircle, Clock, Car, Loader2 } from "lucide-react";
import moment from "moment";
import TimesheetDetailsDialog from "./timesheet-details-dialog";
import { updateTimesheetInvoice, deleteTimesheetInvoice } from "@/redux/actions";

interface TimesheetsTableProps {
    timesheets: IPurchaseOrder[];
    punchDetailsByProject: Record<number, IPunchDetail[]>;
}

const sortByStatus = (timesheets: IPurchaseOrder[]): IPurchaseOrder[] => {
    const statusOrder = {
        'PENDING': 1,
        'REJECTED': 2,
        'APPROVED': 3
    };

    return [...timesheets].sort((a, b) => {
        const statusA = (a.status || 'PENDING').toString().toUpperCase();
        const statusB = (b.status || 'PENDING').toString().toUpperCase();

        const orderA = statusOrder[statusA as keyof typeof statusOrder] || 4;
        const orderB = statusOrder[statusB as keyof typeof statusOrder] || 4;

        return orderA - orderB;
    });
};

const statusToColor: Record<PunchMatchStatus, string> = {
    match: 'text-green-500',
    mismatch: 'text-yellow-500',
    missing: 'text-red-500'
};

const formatPunchTimestamp = (timestamp: string | number | null | undefined): string | null => {
    if (timestamp === null || timestamp === undefined) {
        return null;
    }

    if (typeof timestamp === 'number') {
        const unixSeconds = timestamp > 1e12 ? timestamp / 1000 : timestamp;
        return moment.unix(unixSeconds).utc(false).format('HH:mm');
    }

    const numericValue = Number(timestamp);
    if (!Number.isNaN(numericValue)) {
        const unixSeconds = numericValue > 1e12 ? numericValue / 1000 : numericValue;
        return moment.unix(unixSeconds).utc(false).format('HH:mm');
    }

    const parsed = moment(timestamp);
    if (parsed.isValid()) {
        return parsed.format('HH:mm');
    }

    return null;
};

const toNumericTimestamp = (timestamp: string | number | null | undefined): number | null => {
    if (timestamp === null || timestamp === undefined) {
        return null;
    }

    if (typeof timestamp === 'number') {
        return timestamp;
    }

    const numericValue = Number(timestamp);
    return Number.isNaN(numericValue) ? null : numericValue;
};

const normaliseTime = (value: IPurchaseOrder['startTime']): string | null => {
    if (!value) return null;

    if (Array.isArray(value)) {
        const [hours = 0, minutes = 0] = value;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed || trimmed === '--:--') {
            return null;
        }

        if (trimmed.includes(':')) {
            const [hours = '', minutes = ''] = trimmed.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }

        const digits = trimmed.replace(/\D/g, '');
        if (digits.length >= 3) {
            const hours = digits.slice(0, 2);
            const minutes = digits.slice(2, 4) || '00';
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
    }

    return null;
};

const buildPunchStatus = (
    timesheet: IPurchaseOrder,
    punchDetailsByProject: Record<number, IPunchDetail[]>
): ITimesheetPunchMatch => {
    const projectIdRaw = timesheet.job?.project?.id ?? timesheet.job?.id ?? null;
    const spIdRaw = timesheet.serviceProvider?.id ?? null;

    const projectId = typeof projectIdRaw === 'string' ? Number(projectIdRaw) : projectIdRaw;
    const spId = typeof spIdRaw === 'string' ? Number(spIdRaw) : spIdRaw;

    const evaluate = (
        expectedTime: string | null,
        punch: IPunchDetail | undefined,
        dateMatches: boolean
    ): { status: PunchMatchStatus; punchTime?: string | null } => {
        if (!punch) {
            return { status: 'missing' };
        }

        const punchTime = formatPunchTimestamp(punch.timestamp);
        if (!punchTime) {
            return { status: 'missing' };
        }
        if (!expectedTime) {
            return { status: 'mismatch', punchTime };
        }

        if (!dateMatches) {
            return {
                status: 'missing',
                punchTime
            };
        }

        const matches = expectedTime === punchTime;

        return {
            status: matches ? 'match' : 'mismatch',
            punchTime
        };
    };

    if (!projectId || Number.isNaN(projectId) || !spId || Number.isNaN(spId)) {
        return {
            start: { status: 'missing' },
            end: { status: 'missing' }
        };
    }

    const relevantPunches = punchDetailsByProject[projectId]?.filter(punch => Number(punch.spId) === spId) ?? [];

    const getPunchDate = (punch: IPunchDetail | undefined): string | null => {
        if (!punch) return null;
        const timestamp = toNumericTimestamp(punch.timestamp);
        if (timestamp === null) return null;
        const date = moment.unix(timestamp > 1e12 ? timestamp / 1000 : timestamp).format('YYYY-MM-DD');
        return date;
    };

    const jobEndDate = timesheet.jobDate ? moment(timesheet.jobDate.join('-'), 'YYYY-MM-DD').format('YYYY-MM-DD') : null;

    const pickLatestPunch = (action: string) => {
        return relevantPunches
            .filter(punch => punch.action === action)
            .reduce<IPunchDetail | undefined>((latest, current) => {
                const latestTimestamp = toNumericTimestamp(latest?.timestamp);
                const currentTimestamp = toNumericTimestamp(current.timestamp);

                if (currentTimestamp === null) {
                    return latest;
                }

                if (latestTimestamp === null || latestTimestamp === undefined) {
                    return current;
                }

                if (currentTimestamp >= latestTimestamp) {
                    return current;
                }

                return latest;
            }, undefined);
    };

    const clockIn = pickLatestPunch('CLOCK_IN');
    const clockOut = pickLatestPunch('CLOCK_OUT');

    const startTime = normaliseTime(timesheet.startTime);
    const endTime = normaliseTime(timesheet.endTime);
    const clockInDateMatches = jobEndDate ? getPunchDate(clockIn) === jobEndDate : true;
    const clockOutDateMatches = jobEndDate ? getPunchDate(clockOut) === jobEndDate : true;

    return {
        start: evaluate(startTime, clockIn, clockInDateMatches),
        end: evaluate(endTime, clockOut, clockOutDateMatches)
    };
};

const TimesheetsTableComponent: React.FC<TimesheetsTableProps> = ({ timesheets, punchDetailsByProject }) => {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [approvingIds, setApprovingIds] = useState<number[]>([]);

    const punchStatusMap = useMemo<Record<number, ITimesheetPunchMatch>>(() => {
        return timesheets.reduce((acc, timesheet) => {
            acc[timesheet.id] = buildPunchStatus(timesheet, punchDetailsByProject);
            return acc;
        }, {} as Record<number, ITimesheetPunchMatch>);
    }, [timesheets, punchDetailsByProject]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(timesheets.map(t => t.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedRows([...selectedRows, id]);
        } else {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        }
    };

    // const calculateHours = (timesheet: IPurchaseOrder) => {
    //     // Calculate hours from start_time and end_time if available
    //     if (timesheet.startTime && timesheet.endTime) {
    //         const start = moment(timesheet.startTime, "HH:mm");
    //         const end = moment(timesheet.endTime, "HH:mm");
    //         const breakMinutes = timesheet.breakMinutes ?
    //             moment.duration(timesheet.breakMinutes).asMinutes() : 0;

    //         const totalMinutes = end.diff(start, 'minutes') - breakMinutes;
    //         const hours = Math.floor(totalMinutes / 60);
    //         const minutes = totalMinutes % 60;

    //         const regularHours = Math.min(totalMinutes / 60, 8);
    //         const overtimeHours = Math.max((totalMinutes / 60) - 8, 0);

    //         return {
    //             total: `${hours}.${Math.round((minutes / 60) * 100)}h`,
    //             overtime: overtimeHours > 0 ? `+${overtimeHours.toFixed(2)}h` : null
    //         };
    //     }

    //     // Fallback to hoursWorked if no time fields
    //     return {
    //         total: `${timesheet.hoursWorked || 0}h`,
    //         overtime: null
    //     };
    // };

    const getStatusBadge = (timesheet: IPurchaseOrder) => {
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
            case "PENDING":
            default:
                return (
                    <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-full">
                        In afwachting
                    </span>
                );
        }
    };

    const handleToggleAttention = async (id: number) => {
        const timesheet = timesheets.find(t => t.id === id);
        if (timesheet) {
            const updatedTimesheet = { ...timesheet, attention: !timesheet.attention };
            await updateTimesheetInvoice(updatedTimesheet);
        }
    };

    const handleDelete = async (id: number) => {
        await deleteTimesheetInvoice(id);
    };

    const handleApprove = async (timesheet: IPurchaseOrder) => {
        const currentStatus = (timesheet.status ?? 'PENDING').toString().toUpperCase();
        if (currentStatus === 'APPROVED') {
            return;
        }

        setApprovingIds(prev => prev.includes(timesheet.id) ? prev : [...prev, timesheet.id]);

        try {
            await updateTimesheetInvoice({ ...timesheet, status: 'APPROVED' });
        } finally {
            setApprovingIds(prev => prev.filter(id => id !== timesheet.id));
        }
    };

    const handleEdit = async (timesheet: IPurchaseOrder) => {
        const success = await updateTimesheetInvoice(timesheet);
        return success;
    };



    return (
        <div className="bg-white rounded-lg shadow overflow-hidden flex-1">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left">
                                <Checkbox
                                    checked={timesheets.length > 0 && selectedRows.length === timesheets.length}
                                    onCheckedChange={handleSelectAll}
                                    disabled={timesheets.length === 0}
                                />
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Worker</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Project</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Datum</th>
                            {/* <th className="p-4 text-left text-sm font-medium text-gray-700">Uren</th> */}
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Start Time</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">End Time</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Break</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Kilometer</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Aandacht</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Goedkeuren</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-700">Acties</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortByStatus(timesheets).map((timesheet) => {
                            const matchStatus = punchStatusMap[timesheet.id];
                            const canEditTimesheet = (timesheet.job?.status ?? '').toString().toUpperCase() === 'COMPLETED';
                            const currentStatus = (timesheet.status ?? 'PENDING').toString().toUpperCase();
                            const isApproving = approvingIds.includes(timesheet.id);
                            const canApproveTimesheet = canEditTimesheet && currentStatus !== 'APPROVED';
                            // const hours = calculateHours(timesheet);
                            return (
                                <tr key={timesheet.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <Checkbox
                                            checked={selectedRows.includes(timesheet.id)}
                                            onCheckedChange={(checked) =>
                                                handleSelectRow(timesheet.id, checked as boolean)
                                            }
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {timesheet.serviceProvider.firstName} {timesheet.serviceProvider.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                EMP{timesheet.serviceProvider.id.toString().padStart(3, '0')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="text-gray-900">{timesheet.job?.title}</p>
                                            <p className="text-sm text-gray-500">
                                                ID: {timesheet.job?.id || 'N/A'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-700">
                                        {moment(timesheet.jobDate.join('-'), 'YYYY-MM-DD').format('DD MMM YYYY')}
                                    </td>
                                    {/* <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">{timesheet.workedtime}</span>
                                             {timesheet.workedtime && (
                                                <span className="text-orange-500 font-medium">
                                                    +{timesheet.overtime}
                                                </span>
                                            )}
                                        </div>
                                    </td> */}
                                    {/* <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">
                                                {timesheet.startTime ? timesheet.startTime.slice(0, 5) : '--:--'}
                                            </span>
                                        </div>
                                    </td> */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span
                                                title={matchStatus?.start.punchTime ? `Punch: ${matchStatus.start.punchTime}` : 'No punch recorded'}
                                            >
                                                <Clock
                                                    className={`h-4 w-4 ${statusToColor[matchStatus?.start.status ?? 'missing']}`}
                                                />
                                            </span>
                                            <span className="text-gray-900">
                                                {timesheet.startTime ?
                                                    (Array.isArray(timesheet.startTime) ?
                                                        `${String(timesheet.startTime[0]).padStart(2, '0')}:${String(timesheet.startTime[1]).padStart(2, '0')}` :
                                                        timesheet.startTime.includes(':') ?
                                                            timesheet.startTime.slice(0, 5) :
                                                            timesheet.startTime)
                                                    : '--:--'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span
                                                title={matchStatus?.end.punchTime ? `Punch: ${matchStatus.end.punchTime}` : 'No punch recorded'}
                                            >
                                                <Clock
                                                    className={`h-4 w-4 ${statusToColor[matchStatus?.end.status ?? 'missing']}`}
                                                />
                                            </span>
                                            <span className="text-gray-900">
                                                {timesheet.endTime ?
                                                    (Array.isArray(timesheet.endTime) ?
                                                        `${String(timesheet.endTime[0]).padStart(2, '0')}:${String(timesheet.endTime[1]).padStart(2, '0')}` :
                                                        timesheet.endTime.includes(':') ?
                                                            timesheet.endTime.slice(0, 5) :
                                                            timesheet.endTime)
                                                    : '--:--'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">
                                                {timesheet.breakMinutes ?
                                                    (Array.isArray(timesheet.breakMinutes) ?
                                                        `${String(timesheet.breakMinutes[0]).padStart(2, '0')}:${String(timesheet.breakMinutes[1]).padStart(2, '0')}` :
                                                        timesheet.breakMinutes.includes(':') ?
                                                            timesheet.breakMinutes.slice(0, 5) :
                                                            timesheet.breakMinutes)
                                                    : '--:--'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Car className="h-4 w-4 text-gray-400" />
                                            <span>{timesheet.kilometer ? `${timesheet.kilometer} km` : '0 km'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(timesheet)}
                                    </td>
                                    <td className="p-4">
                                        {timesheet.attention === true && (
                                            <AlertCircle className="h-5 w-5 text-orange-500" />
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {currentStatus === 'APPROVED' ? (
                                            <span className="text-sm font-medium text-green-600">Goedgekeurd</span>
                                        ) : canApproveTimesheet ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                                onClick={() => handleApprove(timesheet)}
                                                disabled={isApproving}
                                            >
                                                {isApproving && <Loader2 className="h-4 w-4 animate-spin" />}
                                                <span>{isApproving ? 'Bezig...' : 'Goedkeuren'}</span>
                                            </Button>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <TimesheetDetailsDialog
                                            timesheet={timesheet}
                                            onToggleAttention={handleToggleAttention}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                            punchMatchStatus={matchStatus}
                                            canEdit={canEditTimesheet}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {timesheets.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    Geen timesheets gevonden
                </div>
            )}
        </div>
    );
};

export default TimesheetsTableComponent;
