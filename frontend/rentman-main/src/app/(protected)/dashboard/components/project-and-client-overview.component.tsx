import React, { useMemo } from 'react';
import { concertDetails } from "@/data/project-details.data";
import { Separator } from "@/components/ui/separator"
import { useAppSelector } from "@/redux/hooks";
import { Badge } from "@/components/ui/badge";
import { Dictionary } from "../../../../../dictionary";

const ProjectAndClientOverviewComponent = ({ lng }: { lng?: Dictionary }) => {
    const { selectedEvent } = useAppSelector(state => state.events)
    const bgColor = useMemo(() => selectedEvent?.status === 'WAITING' ? 'bg-yellow-600' : selectedEvent?.status === 'STARTED' ? 'bg-green-900' : selectedEvent?.status === 'ACCEPTED' ? 'bg-blue-900' : selectedEvent?.status === 'COMPLETED' ? '' : 'bg-red-900', [selectedEvent]);

    return (
        <div className={"flex gap-4 flex-col md:flex-row"}>
            <div className={"border rounded-md p-7 flex flex-col w-full"}>
                <h1 className={"text-xl font-bold mb-6"}>{lng?.dashboard.overview}</h1>
                <p className={"text-sm font-bold text-gray-500 my-1"}>{lng?.dashboard.projectName}:</p>
                <p>{selectedEvent?.project?.name ?? selectedEvent?.title ?? 'Demo Event'}</p>
                <Separator className={"mb-6 mt-1"} />
                <div className={'flex flex-wrap gap-4'}>
                    <div className={'min-w-52'}>
                        <p className={"text-sm font-bold text-gray-500 my-1"}>{lng?.dashboard.projectName}:</p>
                        <p>{selectedEvent?.project?.name ?? selectedEvent?.title ?? "Demo Event"}</p>
                    </div>
                    <div className={'min-w-52'}>
                        <p className={"text-sm font-bold text-gray-500 my-1"}>{lng?.dashboard.projectStatus}:</p>
                        <Badge variant={"default"}
                            className={bgColor}>{selectedEvent?.status?.replace('_', ' ')}</Badge>
                    </div>
                    <div className={'min-w-52'}>
                        <p className={"text-sm font-bold text-gray-500 my-1"}>{lng?.dashboard.projectNumber}:</p>
                        <p>{selectedEvent?.project?.id ?? selectedEvent?.id ?? "09"}</p>
                    </div>
                    <div className={'min-w-52'}>
                        <p className={"text-sm font-bold text-gray-500 my-1"}>{lng?.dashboard.assignedMember}:</p>
                        <p>{selectedEvent?.project_lead_name ?? "Demo Contact"}</p>
                    </div>
                    <div className={'min-w-52'}>
                        <p className={"text-sm font-bold text-gray-500 my-1"}>{lng?.dashboard.freelancers}:</p>
                        <p>{selectedEvent?.number_of_people ?? "0"}</p>
                    </div>
                </div>
            </div>
            <div className={"border rounded-md p-7 flex flex-col w-full"}>
                <h1 className={"text-xl font-bold mb-6"}>{lng?.dashboard.clientOverview}</h1>
                <p className={"text-sm font-bold text-gray-500 my-1"}>{lng?.dashboard.clientName}:</p>
                <p>
                    {(selectedEvent?.client?.first_name || '') + ' ' + (selectedEvent?.client?.last_name || '') || 'Demo Client'}
                </p>
                <Separator className={"mb-6 mt-1"} />
                <div className={'flex flex-wrap gap-4'}>
                    {concertDetails.map((detail, key) => (
                        <div key={key} className={'min-w-52 flex gap-2'}>
                            {detail.icon && detail.icon()}
                            <div>
                                <p className={"text-sm font-bold text-gray-500 mb-[0.1em]"}>{`${detail.detailType}:`}</p>
                                <p>
                                    {detail.detailType === 'Contact person'
                                        ? selectedEvent?.project_lead_name ?? detail.details
                                        : detail.detailType === 'Contact details'
                                            ? [selectedEvent?.project_lead_number, selectedEvent?.client?.email].filter(Boolean).join(' · ') || detail.details
                                            : detail.details}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectAndClientOverviewComponent;
