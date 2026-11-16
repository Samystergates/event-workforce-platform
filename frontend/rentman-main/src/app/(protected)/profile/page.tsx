"use client"
import React from 'react';
import {useSession} from "next-auth/react";
import CommonClientViewComponent from "@/components/profile/common-client-view.component";
import CommonServiceProviderViewComponent from "@/components/profile/common-service-provider-view.component";
import CommonModeratorViewComponent from "@/components/profile/common-moderator-view.component";

const MyProfile = () => {
    const {data: session} = useSession();
    if (!session) return <></>;

    const {user} = session;
    return (
        <div className={'border p-4 rounded-md'}>
            <h1 className={'text-xl font-bold'}>Profiel bewerken</h1>
            <div className={'h-[2px] w-full my-2 mb-6 bg-gray-200 rounded'}/>
            <div>
                {user.depId === 1 ? (
                    <CommonClientViewComponent userId={`${user.id}`} />
                ) : user.depId === 2 ? (
                    <CommonModeratorViewComponent userId={`${user.id}`} />
                ) : (
                    <CommonServiceProviderViewComponent userId={`${user.id}`} />
                )}
            </div>
        </div>
    );
};

export default MyProfile;
