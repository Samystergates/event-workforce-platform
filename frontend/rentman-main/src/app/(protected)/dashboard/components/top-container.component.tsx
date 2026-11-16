import React from 'react';
import EventLocationComponent from "@/app/(protected)/dashboard/components/event-location.component";
import {useSession} from "next-auth/react";

const TopContainerComponent = () => {
    const {data: session} = useSession();
    if (!session) return <></>;

    return (
        <div className={"flex gap-4 flex-col md:flex-row"}>
            <EventLocationComponent/>
        </div>
    );
};

export default TopContainerComponent;
