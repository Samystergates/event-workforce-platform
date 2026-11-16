"use client"
import React, {useEffect, useState} from "react";
import TopContainerComponent from "@/app/(protected)/dashboard/components/top-container.component";
import ProjectAndClientOverviewComponent from "@/app/(protected)/dashboard/components/project-and-client-overview.component";
import EventLocationComponent from "@/app/(protected)/dashboard/components/event-location.component";
import CalenderViewComponent from "@/app/(protected)/dashboard/components/calender-view.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import DashboardAddEventComponent from "@/app/(protected)/dashboard/components/dashboard-add-event.component";
import {useSession} from "next-auth/react";
import {IconsComponent} from "@/components/common/icons.component";
import {Dictionary, getDictionary} from "../../../../dictionary";

export default function Home() {
    const {data: session} = useSession()
    const [lng, setLng] = useState<Dictionary>()

    useEffect(() => {
        const getLng = async () => {
            const lang = await getDictionary('du');
            setLng(lang)
        }
        getLng().then(null)
    }, []);

    if (!session) {
        return (
            <div className={'h-screen flex items-center justify-center'}>
                <IconsComponent.spinner className="mr-2 h-6 w-6 mb-1 animate-spin" /><p>Laden</p>
            </div>
        )
    }

    return (
        <main className={"flex flex-col gap-4"}>
            <HStackComponent className={'justify-between flex !flex-row'}>
                <h1 className={'font-bold text-xl'}>{lng?.dashboard.title}</h1>
                {session.user.depId !== 3 && (
                    <DashboardAddEventComponent />
                )}
            </HStackComponent>
            <CalenderViewComponent/>
            {session.user.depId === 3 && (
                <TopContainerComponent/>
            )}
            <ProjectAndClientOverviewComponent lng={lng}/>
        </main>
    )
}
