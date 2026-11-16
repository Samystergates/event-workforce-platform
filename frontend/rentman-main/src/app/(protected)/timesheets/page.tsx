"use client"
import React, { useEffect, useState } from 'react';
import { useAppSelector } from "@/redux/hooks";
import { IPunchDetail } from "@/interfaces/event.interfaces";
import { getAllInvoices, getPunchesForProjectIds } from "@/redux/actions";
import useAuthRequest from "@/lib/useAuthRequest";
import { IconsComponent } from "@/components/common/icons.component";
import TimesheetsTableComponent from "@/app/(protected)/timesheets/components/timesheets-table.component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import moment from "moment";

const Timesheets = () => {
    const [timesheetsLoading, setTimesheetsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState({
        from: moment().startOf('month').format('YYYY-MM-DD'),
        to: moment().endOf('month').format('YYYY-MM-DD')
    });

    const { purchaseOrders = [] } = useAppSelector(state => state.events);
    useAuthRequest();
    const [punchDetailsByProject, setPunchDetailsByProject] = useState<Record<number, IPunchDetail[]>>({});


    useEffect(() => {
        setTimesheetsLoading(true);
        getAllInvoices(setTimesheetsLoading).then();
    }, []);

    useEffect(() => {
  const projectIds = purchaseOrders
    .map(order => {
      const rawId = order.job?.project?.id ?? order.job?.id;
      const numericId = typeof rawId === 'string' ? Number(rawId) : rawId;
      return Number.isFinite(numericId as number) ? numericId : null;
    })
    .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id));

  if (projectIds.length === 0) {
    return;
  }

  let cancelled = false;

  (async () => {
    const punches = await getPunchesForProjectIds(projectIds);
    if (cancelled || punches.length === 0) {
      return;
    }

    const grouped = punches.reduce<Record<number, IPunchDetail[]>>((acc, punch) => {
      const projectKey = typeof punch.projectId === 'string' ? Number(punch.projectId) : punch.projectId;
      if (projectKey === undefined || projectKey === null || Number.isNaN(projectKey)) {
        return acc;
      }

      acc[projectKey] = acc[projectKey] ? [...acc[projectKey], punch] : [punch];
      return acc;
    }, {});

    setPunchDetailsByProject(grouped);
  })();

  return () => {
    cancelled = true;
  };
}, [purchaseOrders]);

    // const filteredTimesheets = purchaseOrders
    //     .filter(order => {
    //         if (!order || !order.serviceProvider) return false;
    //         const matchesSearch = searchTerm === "" ||
    //             `${order.serviceProvider.firstName || ''} ${order.serviceProvider.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    //         const matchesStatus = statusFilter === "all" ||
    //             (statusFilter === "approved" && order.status?.toUpperCase() === "APPROVED") ||
    //             (statusFilter === "pending" && order.status?.toUpperCase() === "PENDING") ||
    //             (statusFilter === "rejected" && order.status?.toUpperCase() === "REJECTED");
    //         return matchesSearch && matchesStatus;
    //     })
    //     .sort((a, b) => {
    //         const dateA = moment(a.jobDate.join('-'), 'YYYY-MM-DD');
    //         const dateB = moment(b.jobDate.join('-'), 'YYYY-MM-DD');
    //         return dateB.diff(dateA);
    //     });

    const filteredTimesheets = purchaseOrders
        .filter(order => {
            if (!order || !order.serviceProvider) return false;

            // Add date range filtering
            const orderDate = moment(order.jobDate.join('-'), 'YYYY-MM-DD');
            const fromDate = moment(dateRange.from);
            const toDate = moment(dateRange.to);
            const matchesDateRange = orderDate.isSameOrAfter(fromDate, 'day') &&
                orderDate.isSameOrBefore(toDate, 'day');

            const matchesSearch = searchTerm === "" ||
                `${order.serviceProvider.firstName || ''} ${order.serviceProvider.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "approved" && (order.status || '').toString().toUpperCase() === "APPROVED") ||
                (statusFilter === "pending" && (order.status || '').toString().toUpperCase() === "PENDING") ||
                (statusFilter === "rejected" && (order.status || '').toString().toUpperCase() === "REJECTED");

            return matchesSearch && matchesStatus && matchesDateRange;
        })
        .sort((a, b) => {
            const dateA = moment(a.jobDate.join('-'), 'YYYY-MM-DD');
            const dateB = moment(b.jobDate.join('-'), 'YYYY-MM-DD');
            return dateB.diff(dateA);
        });

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Timesheets Overzicht</h1>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex gap-4 items-center flex-wrap">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            type="text"
                            placeholder="Zoek op worker, project..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="flex gap-2 items-center">
                        <span className="text-sm font-medium">Van datum</span>
                        <div className="relative">
                            <Input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            // className="pr-10"
                            />
                            {/* <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" /> */}
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <span className="text-sm font-medium">Tot datum</span>
                        <div className="relative">
                            <Input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            // className="pr-10"
                            />
                            {/* <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" /> */}
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                            const today = moment();
                            setDateRange({
                                from: today.format('YYYY-MM-DD'),
                                to: today.format('YYYY-MM-DD')
                            });
                        }}>Vandaag</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            setDateRange({
                                from: moment().startOf('week').format('YYYY-MM-DD'),
                                to: moment().endOf('week').format('YYYY-MM-DD')
                            });
                        }}>Deze week</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            setDateRange({
                                from: moment().startOf('month').format('YYYY-MM-DD'),
                                to: moment().endOf('month').format('YYYY-MM-DD')
                            });
                        }}>Deze maand</Button>
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Alle statussen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle statussen</SelectItem>
                            <SelectItem value="approved">Goedgekeurd</SelectItem>
                            <SelectItem value="pending">In afwachting</SelectItem>
                            <SelectItem value="rejected">Afgekeurd</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table Section */}
            {timesheetsLoading ? (
                <div className="flex items-center justify-center h-64">
                    <IconsComponent.spinner className="mr-2 h-6 w-6 animate-spin" />
                    <p>Loading Timesheets...</p>
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <TimesheetsTableComponent
                        timesheets={filteredTimesheets}
                        punchDetailsByProject={punchDetailsByProject}
                    />
                </div>
            )}
        </div>
    );
};

export default Timesheets;
