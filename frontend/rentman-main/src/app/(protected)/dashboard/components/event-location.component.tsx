"use client"
import React from 'react';
import {Separator} from "@/components/ui/separator";
import {useAppSelector} from "@/redux/hooks";
import {Rating} from "react-simple-star-rating";

const EventLocationComponent = () => {
    const {selectedServiceProviders} = useAppSelector(state => state.skills)

    return (
        <div className={"border rounded-md p-7 flex gap-4 relative w-full"}>
            <div className={"flex flex-col w-full"}>
                <h1 className={"text-xl font-bold mb-6"}>UW GEGEVENS</h1>
                <p className={"text-sm font-bold text-gray-500 my-1"}>BESCHRIJVING:</p>
                <p>{selectedServiceProviders?.about}</p>
                <Separator className={"mb-6 mt-1"}/>
                <div className={'flex flex-wrap gap-4'}>
                    <div className={'min-w-52'}>
                        <p className={"text-sm font-bold text-gray-500"}>Contactnummer:</p>
                        <p>{selectedServiceProviders?.contact}</p>
                    </div>
                    <div className={'min-w-52'}>
                        <p className={"text-sm font-bold text-gray-500"}>{selectedServiceProviders?.first_name} {selectedServiceProviders?.last_name}</p>
                        <p>{selectedServiceProviders?.email}</p>
                    </div>
                    <div className={'min-w-52'}>
                        <p className={"text-sm font-bold text-gray-500"}>Beoordelingen:</p>
                        <Rating SVGstyle={{display: 'inline'}} size={25} readonly onClick={() => {}} initialValue={(Number(selectedServiceProviders?.rating) * 10) / 2}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventLocationComponent;
