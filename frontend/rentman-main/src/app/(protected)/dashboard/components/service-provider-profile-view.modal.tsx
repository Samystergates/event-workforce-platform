import React from 'react';
import CommonDialogComponent from "@/components/common/common-dialog.component";
import CommonServiceProviderViewComponent from "@/components/profile/common-service-provider-view.component";
import {useSession} from "next-auth/react";

const ServiceProviderProfileViewModal = ({userId, userName}: {userId: string; userName: string}) => {
    const {data: session} = useSession()

    return (
        <CommonDialogComponent
            triggerLabel={'View Profile'}
            triggerClassName={'w-fit self-end !h-[2.5em]'}
            dialogTitle={userName}
            contentClassName={'max-w-[55%]'}
            triggerVariant={'outline'}
            dialogBody={
                <>
                    <div className={'bg-gray-200 rounded w-full h-[2px] !mb-5'}/>
                    <CommonServiceProviderViewComponent userId={userId} disabled={session?.user?.depId !== 2}/>
                </>
            }
        />
    );
};

export default ServiceProviderProfileViewModal;
