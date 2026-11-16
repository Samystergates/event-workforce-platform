"use client"

import * as React from "react"
import { IoCalendarOutline } from "react-icons/io5"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import moment from "moment";

type componentType = {
  startDate: Date,
  setStartDate: React.Dispatch<React.SetStateAction<Date>>,
  endDate: Date,
  setEndDate: React.Dispatch<React.SetStateAction<Date>>,
  disabled?: boolean
}

export function CalendarDateRangePicker({endDate, setStartDate, startDate, setEndDate, disabled}: componentType) {

  return (
    <div className='w-full'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={"justify-start text-left font-normal w-full text-xs md:text-sm"}
          >
            <IoCalendarOutline className="mr-2 h-4 w-4" />
            {moment(startDate).format('MMM DD, YYYY')} -{" "}{moment(endDate).format('MMM DD, YYYY')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={startDate}
            disabled={disabled}
            selected={{from: startDate, to: endDate}}
            onSelect={(e: any) => {
              const startOfMonth = new Date();
              startOfMonth.setDate(1);
              const endOfMonth = new Date();
              endOfMonth.setDate(31);
              setStartDate(e?.from ?? startOfMonth)
              setEndDate(e?.to ?? endOfMonth)
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
