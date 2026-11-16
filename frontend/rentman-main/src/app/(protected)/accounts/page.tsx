"use client"
import React, { useEffect, useState } from 'react';
import { getAllSkills } from "@/redux/actions/skillActions";
import {
    getAllServiceProviders,
    getAllServiceProvidersAnyStatus,
    getAllServiceProvidersWithAvailability
} from "@/redux/actions";
import HStackComponent from "@/components/common/horizontal-stack.component";
import { IconsComponent } from "@/components/common/icons.component";
import { Button } from "@/components/ui/button";
import { IoRefresh } from "react-icons/io5";
import { useAppSelector } from "@/redux/hooks";
import { isEmpty } from "lodash";
import AllServiceDataTable from "@/app/(protected)/accounts/components/all-service-data-table.component";
import { CalendarDateRangePicker } from "@/components/common/date-range-picker";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AllServiceProviders = () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const endOfMonth = new Date();
    endOfMonth.setDate(31);
    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);
    const [userStatus, setUserStatus] = useState('allUser')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [serviceProviderLoading, setServiceProviderLoading] = useState<boolean>(false);

    useEffect(() => {
        getAllServiceProvidersAnyStatus(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), setServiceProviderLoading).then(null)

    }, [startDate, endDate]);

    const handleRefresh = (reset?: boolean) => {
        if (reset) {
            getAllServiceProvidersAnyStatus(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD')).then(null)
        } else {
            getAllServiceProvidersAnyStatus(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), setServiceProviderLoading).then(null)
        }
    }

    return (
        <div className={"p-6"}>
            <HStackComponent className={'justify-between'}>
                <h1 className={'font-bold text-xl'}>Alle zzp&apos;ers</h1>
                <HStackComponent className={'w-full md:w-fit !flex-row'}>
                    <CalendarDateRangePicker setEndDate={setEndDate} setStartDate={setStartDate} startDate={startDate}
                        endDate={endDate} />
                    <Button onClick={() => handleRefresh()}>
                        <HStackComponent className={'gap-2 !flex-row'}>
                            <p>Vernieuwen</p> {serviceProviderLoading ? <IconsComponent.spinner className="h-3 w-3 animate-spin" /> : <IoRefresh />}
                        </HStackComponent>
                    </Button>
                </HStackComponent>
            </HStackComponent>
            <div className="flex flex-col gap-4 mt-5">
      <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
              type="text"
              placeholder="Zoek op naam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
          />
      </div>
            <HStackComponent className={'justify-start mt-5 !flex-row !flex-wrap'}>
                <Button variant={userStatus === 'allUser' ? 'default' : 'outline'}
                    onClick={() => setUserStatus('allUser')}>Alle user</Button>
                <Button variant={userStatus === 'available' ? 'default' : 'outline'}
                    onClick={() => setUserStatus('available')}>Beschikbaar</Button>
                <Button variant={userStatus === 'unAvailable' ? 'default' : 'outline'}
                    onClick={() => setUserStatus('unAvailable')}>Niet beschikbaar</Button>
                <Button variant={userStatus === 'maybe' ? 'default' : 'outline'}
                    onClick={() => setUserStatus('maybe')}>Misschien</Button>
                <Button variant={userStatus === 'unknown' ? 'default' : 'outline'}
                    onClick={() => setUserStatus('unknown')}>Onbekend</Button>
            </HStackComponent>
            </div>
            <AllServiceDataTable serviceProviderLoading={serviceProviderLoading} userStatus={userStatus} searchQuery={searchQuery} handleRefresh={() => handleRefresh(true)} />
        </div>
    );
};

export default AllServiceProviders;
