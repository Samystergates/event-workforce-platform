import React, {useState} from 'react';
import {IEvent, PotentialServiceProvider} from "@/interfaces/event.interfaces";
import VStackComponent from "@/components/common/vertical-stack.component";
import {useAppSelector} from "@/redux/hooks";
import {IUserProfile} from "@/interfaces/user.interfaces";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button} from "@/components/ui/button";
import {actionEvents, getAllJobs} from "@/redux/actions";
import {IconsComponent} from "@/components/common/icons.component";

const AcceptForServiceProvider = ({eventInfo}: { eventInfo: IEvent }) => {
    const {serviceProviders} = useAppSelector(state => state.user)
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    const serviceProviderInfo = (basicServiceProvidersInfo: PotentialServiceProvider): IUserProfile | undefined => {
        return serviceProviders.find(provider => provider.id === basicServiceProvidersInfo.service_provider_id)
    }

    const handleAcceptReject = (service_provider_id: number, action: number, job_id: number) => {
        actionEvents(service_provider_id, setActionLoading, job_id, action, eventInfo, (() => getAllJobs(undefined, 'acceptedEvents').then(null))).then(null)
    }

    return (
        <VStackComponent className={'gap-2'}>
            <HStackComponent className={'bg-gray-100 justify-between p-3.5 rounded'}>
                <p className={'font-bold'}>Name</p>

                <p className={'font-bold'}>Action</p>
            </HStackComponent>
            {eventInfo.potential_service_providers.map(value => (
                <HStackComponent key={value.service_provider_id} className={'bg-gray-100 justify-between pl-3.5 rounded'}>
                    <p>{serviceProviderInfo(value)?.first_name} {serviceProviderInfo(value)?.last_name}</p>
                    {value.accepted === -1 ? (
                        <Button
                            variant={'ghost'}
                            className={'text-green-600'}
                            onClick={() => handleAcceptReject(serviceProviderInfo(value)?.id ?? 0, 1, value.job_id)}>
                            {actionLoading && <IconsComponent.spinner className="h-3 w-3 animate-spin"/>}Accept
                        </Button>
                    ) : value.accepted === 0 ? (
                        <p className={'text-red-600 h-10 px-4 py-2'}>Declined</p>
                    ) : (
                        <p className={'text-green-600 h-10 px-4 py-2'}>Accepted</p>
                    )}
                </HStackComponent>
            ))}
        </VStackComponent>
    );
};

export default AcceptForServiceProvider;
