import store from "@/redux/store";
import {
    filterPotentialEvents, resetInvoice, resetPurchaseOrder,
    saveEvents, saveInvoice,
    savePotentialEvents, savePurchaseOrder, savePurchaseOrders,
    saveSelectedEvent, updatePurchaseOrder, removePurchaseOrder
} from "@/redux/reducers/eventReducers";
import { axios } from "@/lib/axiosInstance";
import { toast } from "@/components/ui/use-toast";
import React from "react";
import { IEvent, IInvoices, IPotentialJobs, IPurchaseOrder, IPunchDetail } from "@/interfaces/event.interfaces";
import { isEmpty, isNil } from "lodash";
import moment from "moment";
import { format, formatTimeArrayForInput, formatTimeArrayToString } from "@/util/common";
import { appLogger } from "@/lib/logger";

const { dispatch } = store

export const getAllJobs = async (setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>, eventsDisplayType?: string) => {
    setIsLoading && setIsLoading(true)
    const jobData = await axios.get('/job/getAllJobs')
    if (jobData?.data?.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: jobData.data.error,
        })
        setIsLoading && setIsLoading(false)
    } else {
        if (eventsDisplayType === 'pendingEvents') {
            const saveEventsData = jobData.data.filter((tempEvent: IEvent) => Number(tempEvent.moderator_approval) === 0).reverse();
            dispatch(saveEvents(saveEventsData))
            if (!isEmpty(saveEventsData)) {
                dispatch(saveSelectedEvent(saveEventsData[0]))
            }
        } else if (eventsDisplayType === 'inProgress') {
            const saveEventsData = jobData.data.filter((tempEvent: IEvent) => tempEvent.service_providers_list.length === tempEvent.number_of_people).map((value: IEvent) => ({
                ...value,
                status: 'STARTED'
            })).reverse();
            dispatch(saveEvents(saveEventsData))
            if (!isEmpty(saveEventsData)) {
                dispatch(saveSelectedEvent(saveEventsData[0]))
            }
        } else if (eventsDisplayType === 'declineEvents') {
            const saveEventsData = jobData.data.filter((tempEvent: IEvent) => Number(tempEvent.moderator_approval) === -1).reverse();
            dispatch(saveEvents(saveEventsData))
            if (!isEmpty(saveEventsData)) {
                dispatch(saveSelectedEvent(saveEventsData[0]))
            }
        } else if (eventsDisplayType === 'acceptedEvents') {
            const saveEventsData = jobData.data.filter((tempEvent: IEvent) => (tempEvent.service_providers_list.length !== tempEvent.number_of_people && Number(tempEvent.moderator_approval) === 1)).reverse();
            dispatch(saveEvents(saveEventsData))
            if (!isEmpty(saveEventsData)) {
                dispatch(saveSelectedEvent(saveEventsData[0]))
            }
        } else {
            // const saveEventsData = jobData.data.map((value: IEvent) => ({
            //     ...value,
            //     status: (value.reviewed_by_client || value.reviewed_by_service_provider) ? 'COMPLETED' : value.service_providers_list.length === value.number_of_people ? 'STARTED' : value.status
            // })).reverse();

            // const saveEventsData = jobData.data.map((value: IEvent) => {
            //     const allProvidersReviewed = value.reviewed_by_service_provider
            //         ? Object.values(value.reviewed_by_service_provider).every(Boolean)
            //         : false;

            //     return {
            //         ...value,
            //         status: (value.reviewed_by_client || allProvidersReviewed)
            //             ? 'COMPLETED'
            //             : value.service_providers_list.length === value.number_of_people
            //                 ? 'STARTED'
            //                 : value.status
            //     };
            // }).reverse();

            const saveEventsData = jobData.data.map((value: IEvent) => ({
                ...value,
                status: value.status === 'COMPLETED' ? 'COMPLETED' : value.service_providers_list.length === value.number_of_people ? 'STARTED' : value.status
            })).reverse();

            dispatch(saveEvents(saveEventsData))
            if (!isEmpty(saveEventsData)) {
                dispatch(saveSelectedEvent(saveEventsData[0]))
            }
        }
        setIsLoading && setIsLoading(false)
    }
}

export const getAllInvoices = async (setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    const invoice = await axios.get('/job/list')
    if (invoice?.data?.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: invoice?.data?.error,
        })
        dispatch(resetPurchaseOrder())
        setIsLoading && setIsLoading(false)
    } else {
        dispatch(savePurchaseOrders(invoice.data.filter((value: {
            invoiceType: string;
        }) => value.invoiceType === "PURCHASE")))
        setIsLoading && setIsLoading(false)
    }
}

export const savePurchaseOrderAction = (e: IPurchaseOrder) => {
    dispatch(savePurchaseOrder(e))
}

export const getServiceProvidersJobs = async (id: string, setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading && setIsLoading(true)
    const jobData = await axios.get(`/job/getAllJobsServiceProviderIds/${id}`)
    if (jobData?.data?.error) {
        setIsLoading && setIsLoading(false)
        dispatch(saveEvents([]))
    } else {
        const saveEventsData = jobData.data.map((value: IEvent) => ({
            ...value,
            status: (value.reviewed_by_client || value.reviewed_by_service_provider) ? 'COMPLETED' : value.status === 'ACCEPTED' ? 'STARTED' : value.status
        })).reverse();
        dispatch(saveEvents(saveEventsData))
        if (!isEmpty(saveEvents)) {
            dispatch(saveSelectedEvent(saveEventsData[0]))
        }
        setIsLoading && setIsLoading(false)
    }
}

export const getClientsJobs = async (id: string, setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading && setIsLoading(true)
    const jobData = await axios.get(`/job/getAllJobsByClientId/${id}`)
    if (jobData?.data?.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: jobData?.data?.error,
        })
        dispatch(saveEvents([]))
        setIsLoading && setIsLoading(false)
    } else {
        const saveEventsData = jobData.data.map((value: IEvent) => ({
            ...value,
            status: (value.reviewed_by_client || value.reviewed_by_service_provider) ? 'COMPLETED' : (value.status === 'ACCEPTED' && value.service_providers_list.length === value.number_of_people) ? 'STARTED' : value.status === 'ACCEPTED' ? 'WAITING' : value.status
        })).reverse();
        dispatch(saveEvents(saveEventsData))
        if (!isEmpty(saveEventsData)) {
            dispatch(saveSelectedEvent(saveEventsData[0]))
        }
        setIsLoading && setIsLoading(false)
    }
}

export const getModeratorJobs = async (id: string, setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading && setIsLoading(true)
    const jobData = await axios.get(`/job/getAllJobsByModeratorId/${id}`)
    if (jobData?.data?.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: jobData?.data?.error,
        })
        setIsLoading && setIsLoading(false)
    } else {
        dispatch(saveEvents(jobData.data))
        setIsLoading && setIsLoading(false)
    }
}

export const getRequestJobs = async (id: string, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, eventsDisplayType: string) => {
    setIsLoading(true)
    const jobData = await axios.get(`/job/getPotentialJobOffersToServiceProvider/${id}`)
    if (jobData?.data?.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: jobData?.data?.error,
        })
        setIsLoading(false)
        dispatch(savePotentialEvents([]))
    } else {
        let saveTempEvents: IEvent[] = []
        const promise: any[] = []
        jobData.data.filter((event: IPotentialJobs) => {
            if (eventsDisplayType === 'pendingEvents') {
                return event.accepted === -1
            } else if (eventsDisplayType === 'inProgress') {
                return event.accepted !== 0
            } else return event
        }).forEach((async (job: IPotentialJobs) => {
            promise.push(axios.get(`/job/getJob/${job.job_id}`))
        }))
        Promise.all(promise).then(promiseData => {
            promiseData.forEach(response => {
                if (!response.data.error) {
                    if (!response.data.error) {
                        saveTempEvents = [...saveTempEvents, response.data]
                    }
                }
            })
            if (eventsDisplayType === 'inProgress') {
                dispatch(savePotentialEvents(saveTempEvents.filter(tempEvent => tempEvent.service_providers_list.find(value => value.id === Number(id))).map(value => ({
                    ...value,
                    status: 'STARTED'
                }))))
            } else if (eventsDisplayType === 'allEvents') {
                dispatch(savePotentialEvents(saveTempEvents.filter(tempEvent => Number(tempEvent.moderator_approval) === 1).map(value => ({
                    ...value,
                    status: value.service_providers_list.find(value => value.id === Number(id)) ? 'STARTED' : value.status
                }))))
            } else {
                dispatch(savePotentialEvents(saveTempEvents.filter(tempEvent => Number(tempEvent.moderator_approval) === 1 && !tempEvent.service_providers_list.find(value => value.id === Number(id)))))
            }
            setIsLoading(false)
        })
    }
}

export const actionEvents = async (service_provider_id: number, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, job_id: number, actionValue: number, eventInfo: IEvent, callback?: () => void) => {
    setIsLoading(true)
    const jobData = await axios.post(`/job/${actionValue === 1 ? 'acceptJobOffers' : 'rejectJobOffers'}`, [
        {
            "job_id": job_id,
            "service_provider_id": service_provider_id
        }
    ])
    if (!jobData || jobData.data !== 'Updated') {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: jobData?.data?.error,
        })
        setIsLoading(false)
    } else {
        if (actionValue === 0) {
            const client = eventInfo.client ? { id: eventInfo.client.id } : undefined
            const moderator = eventInfo.moderator ? { id: eventInfo.moderator.id } : undefined
             const { reviewed_by_client, reviewed_by_service_provider, ...eventWithoutReviews } = eventInfo
            await axios.post('/job/updateJob', {
                //...eventInfo,
                ...eventWithoutReviews,
                client: client,
                moderator: moderator,
                start_date: moment(eventInfo.start_date.join('-')).format('YYYY-MM-DD'),
                end_date: moment(eventInfo.end_date.join('-')).format('YYYY-MM-DD'),
                service_providers_list: eventInfo.service_providers_list.filter(list => list.id !== service_provider_id).map(value => ({ id: value.id })),
                created_by: { id: eventInfo.created_by?.id },
                start_time: eventInfo?.start_time?.map(value => format(`${value}`))?.join(':'),
                end_time: eventInfo?.end_time?.map(value => format(`${value}`))?.join(':'),
                required_skills: eventInfo.required_skills.map((skills) => ({ id: skills.id })),
                potential_service_providers: eventInfo.potential_service_providers.filter(list => list.service_provider_id !== service_provider_id).map((service_providers) => ({ service_provider_id: service_providers.service_provider_id }))
            })
            toast({
                variant: "default",
                title: "You are removed from this job.",
                description: jobData?.data?.error,
            })
        }
        setIsLoading(false)
        callback && callback()
        dispatch(filterPotentialEvents(job_id))
    }
}

export const moderatorApprovalAction = async (setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, eventInfo: IEvent, action: number, onSuccess?: () => void) => {
    setIsLoading(true)
    const client = eventInfo.client ? { id: eventInfo.client.id } : undefined
    const moderator = eventInfo.moderator ? { id: eventInfo.moderator.id } : undefined
    const createEventRes = await axios.post('/job/updateJob', {
        ...eventInfo,
        client: client,
        moderator: moderator,
        status: action === 1 ? "ACCEPTED" : "DECLINED",
        id: eventInfo.id,
        moderator_approval: action,
        start_date: moment(eventInfo.start_date.join('-')).format('YYYY-MM-DD'),
        end_date: moment(eventInfo.end_date.join('-')).format('YYYY-MM-DD'),
        service_providers_list: eventInfo.service_providers_list.map(value => ({ id: value.id })),
        created_by: { id: eventInfo.created_by?.id },
        start_time: eventInfo?.start_time?.map(value => format(`${value}`))?.join(':'),
        end_time: eventInfo?.end_time?.map(value => format(`${value}`))?.join(':'),
        required_skills: eventInfo.required_skills.map((skills) => ({ id: skills.id })),
        potential_service_providers: eventInfo.potential_service_providers.map((service_providers) => ({ service_provider_id: service_providers.service_provider_id }))
    })
    if (createEventRes.data.error || createEventRes.data === 'error in api execution') {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: createEventRes.data.error,
        })
        setIsLoading(false)
    } else {
        toast({
            description: "You have successfully update an event.",
        })
        onSuccess && onSuccess()
        setIsLoading(false)
    }
}

export const setSelectedEvent = (event: IEvent) => {
    dispatch(saveSelectedEvent(event))
}

export const getClientEventDetails = async (token: string, setEvent: (value: IEvent) => void, setValue?: any, setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading && setIsLoading(true)
    const jobData = await axios.get(`/job/review-form/client/${token}`)
    if (jobData?.data?.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: jobData.data.error,
        })
        setIsLoading && setIsLoading(false)
    } else {
        const saveEventsData = {
            ...jobData.data,
            status: (jobData.data.reviewed_by_client || jobData.data.reviewed_by_service_provider) ? 'COMPLETED' : (jobData.data.status === 'ACCEPTED' && jobData.data.service_providers_list.length === jobData.data.number_of_people) ? 'STARTED' : jobData.data.status === 'ACCEPTED' ? 'WAITING' : jobData.data.status
        }
        setEvent(saveEventsData)
        setValue && setValue("title", jobData.data ? jobData.data.title : '')
        setValue && setValue("destination", jobData.data ? jobData.data.destination : '')
        setValue && setValue("role", jobData.data ? jobData.data.role : '')
        setValue && setValue("description", jobData.data ? jobData.data.description : '')
        setValue && setValue("client", jobData.data ? jobData.data.client?.id : '')
        setValue && setValue("moderator", jobData.data ? jobData.data.moderator?.id : '')
        setValue && setValue("created_by", jobData.data ? jobData.data.created_by?.id : '')
        setValue && setValue("start_time", jobData.data ? jobData.data.start_time?.map((value: any) => format(`${value}`))?.join(':') : '')
        setValue && setValue("end_time", jobData.data ? jobData.data.end_time?.map((value: any) => format(`${value}`))?.join(':') : '')
        setValue && setValue("project_lead_name", jobData.data ? jobData.data.project_lead_name : '')
        setValue && setValue("project_lead_number", jobData.data ? jobData.data.project_lead_number : '')
        setValue && setValue("project_id", jobData.data?.project ? jobData.data.project.id : undefined)
        setValue && setValue("number_of_people", jobData.data ? jobData.data.number_of_people : '')
        setValue && setValue("required_skills", jobData.data ? jobData.data.required_skills.map((skill: {
            id: any;
        }) => skill.id) : '')
        setValue && setValue("potential_service_providers", jobData.data ? jobData.data.potential_service_providers.map((service_providers: {
            service_provider_id: any;
        }) => service_providers.service_provider_id) : '')
        setValue && setValue("start_date", jobData.data ? moment(jobData.data.start_date.join('-')).format('YYYY-MM-DD') : '')
        setValue && setValue("end_date", jobData.data ? moment(jobData.data.end_date.join('-')).format('YYYY-MM-DD') : '')
        setIsLoading && setIsLoading(false)
    }
}

export const getInvoice = async (id: number, setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading && setIsLoading(true)
    const invoice = await axios.post(`/job/create-invoices-po/${id}`)
    if (invoice?.data?.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: invoice?.data?.error,
        })
        dispatch(resetInvoice())
        setIsLoading && setIsLoading(false)
    } else {
        // Prefer the actual invoice if present; otherwise fall back to purchase order
        const list = invoice.data as any[]
        const chosen = Array.isArray(list)
            ? (list.find((v: any) => v.invoiceType === "INVOICE") || list.find((v: any) => v.invoiceType === "PURCHASE") || null)
            : invoice.data
        dispatch(saveInvoice(chosen))
        setIsLoading && setIsLoading(false)
    }
}

export const resetInvoices = () => {
    dispatch(resetInvoice())
}

export const updateInvoice = async (id: number, data: IInvoices): Promise<boolean> => {
    const invoice = await axios.put(`/job/update-invoice/${id}`, data)
    if (invoice.data) {
        dispatch(saveInvoice(invoice.data))
        toast({
            variant: "default",
            title: "Invoice updated.",
            description: invoice?.data?.error,
        })
        return true
    } else {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: invoice?.data?.error,
        })
        return false
    }
}

export const downLoadPdf = async (id: number, setMergingLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setMergingLoading && setMergingLoading(true);
    try {
        const response = await axios.get(`/job/invoice/print-pdf/${id}`, {
            responseType: 'blob', // 👈 important!
        });
        setMergingLoading && setMergingLoading(false);

        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice.pdf'; // You can customize this
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        setMergingLoading && setMergingLoading(false);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: 'Could not download PDF.',
        });
        appLogger.error('Download error:', error);
    }
};

export const getInvoicePdf = async (id: number, setMergingLoading?: React.Dispatch<React.SetStateAction<boolean>>, onSaveUrl?: (url: string) => void) => {
    setMergingLoading && setMergingLoading(true);
    try {
        const response = await axios.get(`/job/invoice/print-pdf/${id}`, {
            responseType: 'blob', // 👈 important!
        });
        setMergingLoading && setMergingLoading(false);

        const url = window.URL.createObjectURL(response.data);
        onSaveUrl && onSaveUrl(url)
    } catch (error) {
        setMergingLoading && setMergingLoading(false);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: 'Could not download PDF.',
        });
        appLogger.error('Download error:', error);
    }
};


export const sendEmail = async (id: number, data: any) => {
    const response = await axios.post(`/job/invoice/send-email/${id}`, data)
    if (response.data) {
        toast({
            variant: "default",
            title: "Email sent successfully",
            description: '',
        })
    } else {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: '',
        })
    }
}

export const mergeInvoiceAction = async (id: number, data: number[], setMergingLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    const invoice = await axios.post(`/job/merge-invoices/${id}`, data)
    setMergingLoading(false)
    if (invoice.data) {
        dispatch(saveInvoice(invoice.data))
    } else {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: invoice?.data?.error,
        })
    }
}

export const updateTimesheetInvoice = async (invoiceData: IPurchaseOrder): Promise<boolean> => {
    try {
        // Ensure status is a valid enum value
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        let status = (invoiceData.status || 'PENDING').toString().toUpperCase();
        if (!validStatuses.includes(status)) {
            status = 'PENDING';
        }

        // Transform to match backend DTO field names
        const payload = {
            id: invoiceData.id,
            job: invoiceData.job ? { id: invoiceData.job.id } : null,
            service_provider: invoiceData.serviceProvider ? { id: invoiceData.serviceProvider.id } : null,
            kilometer: Number(invoiceData.kilometer) || 0,
            extra_cost: Number(invoiceData.extraCost) || 0,
            extra_cost_description: invoiceData.extraCostDescription || invoiceData.invoiceDescription || '',
            break_minutes: invoiceData.breakMinutes,
            end_time: invoiceData.endTime,
            start_time: invoiceData.startTime,
            status: status, // Send valid enum value
            attention: Boolean(invoiceData.attention),
            // overtime: Number(invoiceData.overtime) || 0,
            // travel_time: Number(invoiceData.traveltime) || 0,
            total_time_worked: Number(invoiceData.workedtime) || 0,
            invoice_type: 'PURCHASE', // Make sure this is also a valid enum
            jobDate: invoiceData.jobDate,
            dagen: invoiceData.dayOrHour || null,
            percentage_switch: null,
            percentage_number: null,
            reviewedBySp: Boolean(invoiceData.reviewedBySP) || null,
            reviewedByClient: Boolean(invoiceData.reviewedByClient) || null,
            files: null,
            created_date: null
        };

        const response = await axios.put('/job/update-invoice-timesheet/', payload);

        if (response.data) {
            // Map the response back to frontend format
            const updatedTimesheet: IPurchaseOrder = {
                ...invoiceData,
                // Only override fields that came from backend
                status: response.data.status || invoiceData.status,
                workedtime: response.data.total_time_worked ?? response.data.workedtime ?? invoiceData.workedtime,
                // traveltime: response.data.travel_time ?? response.data.traveltime ?? invoiceData.traveltime,
                // overtime: response.data.overtime ?? invoiceData.overtime,
                breakMinutes: response.data.break_minutes ?? response.data.breakMinutes ?? invoiceData.breakMinutes,
                extraCostDescription: response.data.extra_cost_description ?? invoiceData.extraCostDescription,
                attention: response.data.attention ?? invoiceData.attention,
                kilometer: response.data.kilometer ?? invoiceData.kilometer,
                extraCost: response.data.extra_cost ?? invoiceData.extraCost,
            };

            dispatch(updatePurchaseOrder(updatedTimesheet));
            toast({
                description: "Timesheet updated successfully",
            });
            return true;
        }
    } catch (error: any) {
        appLogger.error('Error updating timesheet:', error);

        toast({
            variant: "destructive",
            title: "Error updating timesheet",
            description: error.response?.data?.message || "Please try again later",
        });
    }
    return false;
};

export const deleteTimesheetInvoice = async (invoiceId: number): Promise<boolean> => {
    try {
        const response = await axios.delete(`/job/delete-invoice/${invoiceId}`);
        if (response.data) {
            // Remove from store
            dispatch(removePurchaseOrder(invoiceId));
            toast({
                description: "Timesheet deleted successfully",
            });
            return true;
        }
    } catch (error) {
        appLogger.error('Error deleting timesheet:', error);
        toast({
            variant: "destructive",
            description: "Failed to delete timesheet",
        });
    }
    return false;
};

export const getPunchesForProjectIds = async (projectIds: number[]): Promise<IPunchDetail[]> => {
  if (projectIds.length === 0) {
    return [];
  }

  const uniqIds = Array.from(new Set(projectIds));
  const pathParam = uniqIds.join(',');

  const response = await axios.get(`/job/get-punches/${pathParam}`);
  if (response?.data?.error) {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: response.data.error,
    });
    return [];
  }

  return response.data ?? [];
};
