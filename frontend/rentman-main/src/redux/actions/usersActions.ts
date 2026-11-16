import React from "react";
import store from "@/redux/store";
import {toast} from "@/components/ui/use-toast";
import {axios} from "@/lib/axiosInstance";
import {
    saveAllClients,
    saveAllModerator,
    saveAllServiceProviders, saveAvailableServiceProviders, saveMaybeServiceProviders,
    saveSelectedClient,
    saveSelectedModerator,
    saveSelectedServiceProviders, saveUnavailableServiceProviders, saveUnknownServiceProviders
} from "@/redux/reducers/userReducers";
import {saveSelectedServiceProvidersFromSkills} from "@/redux/reducers/skillReducers";
import {IUserProfile} from "@/interfaces/user.interfaces";
import moment from "moment";

const {dispatch} = store

export const getAllClient = async (setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading(true)
    const clientData = await axios.get('/user/getAllClients')
    if (clientData.data.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: clientData.data.error,
        })
        setIsLoading(false)
        dispatch(saveAllClients([]))
    } else {
        dispatch(saveAllClients(clientData.data))
        setIsLoading(false)
    }
}

export const getAllServiceProviders = async (setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading && setIsLoading(true)
    const serviceProvidersData = await axios.get('/user/getAllServiceProviders')
    if (serviceProvidersData.data.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: serviceProvidersData.data.error,
        })
        setIsLoading && setIsLoading(false)
        dispatch(saveAllServiceProviders([]))
    } else {
        dispatch(saveAllServiceProviders(serviceProvidersData.data))
        setIsLoading && setIsLoading(false)
    }
}

export const getAllServiceProvidersWithAvailability = async (start_date: string, end_date: string, setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading && setIsLoading(true)
    const serviceProvidersData = await axios.get(`/user/getServiceProvidersAvailableBetweenDates/${start_date}/${end_date}`)
    if (serviceProvidersData.data.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: serviceProvidersData.data.error,
        })
        setIsLoading && setIsLoading(false)
        dispatch(saveAllServiceProviders([]))
    } else {
        dispatch(saveAllServiceProviders(serviceProvidersData.data))
        setTimeout(() => {
            setIsLoading && setIsLoading(false)
        }, 500)
    }
}

export const getAllServiceProvidersAnyStatus = async (start_date: string, end_date: string, setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading && setIsLoading(true)
    const serviceProvidersData = await axios.get(`/user/getServiceProvidersBetweenDates/${start_date}/${end_date}`)
    if (serviceProvidersData.data.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: serviceProvidersData.data.error,
        })
        setIsLoading && setIsLoading(false)
        dispatch(saveMaybeServiceProviders([]))
        dispatch(saveUnknownServiceProviders([]))
        dispatch(saveAvailableServiceProviders([]))
        dispatch(saveUnavailableServiceProviders([]))
    } else {
        dispatch(saveMaybeServiceProviders(serviceProvidersData.data.Maybe.map((serviceProvider: any) => ({...serviceProvider, status: 'Maybe'}))))
        dispatch(saveUnknownServiceProviders(serviceProvidersData.data.Unknown.map((serviceProvider: any) => ({...serviceProvider, status: 'Unknown'}))))
        dispatch(saveAvailableServiceProviders(serviceProvidersData.data.Available.map((serviceProvider: any) => ({...serviceProvider, status: 'Available'}))))
        dispatch(saveUnavailableServiceProviders(serviceProvidersData.data.Unavailable.map((serviceProvider: any) => ({...serviceProvider, status: 'Unavailable'}))))
        setTimeout(() => {
            setIsLoading && setIsLoading(false)
        }, 500)
    }
}

export const getAllModerators = async (setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoading(true)
    const serviceProvidersData = await axios.get('/user/getAllModerators')
    if (serviceProvidersData.data.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: serviceProvidersData.data.error,
        })
        setIsLoading(false)
        dispatch(saveAllModerator([]))
    } else {
        dispatch(saveAllModerator(serviceProvidersData.data))
        setIsLoading(false)
    }
}

export const getSelectedServiceProviders = async (setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, userId: string) => {
    setIsLoading(true)
    const serviceProviderData = await axios.get(`/user/getServiceProvider/${userId}`)
    if (serviceProviderData.data.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: serviceProviderData.data.error,
        })
        setIsLoading(false)
        dispatch(saveSelectedServiceProvidersFromSkills(null))
    } else {
        dispatch(saveSelectedServiceProvidersFromSkills({
            ...serviceProviderData.data,
            availability_dates: serviceProviderData.data.availability_dates.map((date: any[]) => moment(new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]))).format('YYYY-MM-DD')),
            unavailability_dates: serviceProviderData.data.unavailability_dates.map((date: any[]) => moment(new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]))).format('YYYY-MM-DD')),
            unknown_dates: serviceProviderData.data.unknown_dates.map((date: any[]) => moment(new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]))).format('YYYY-MM-DD'))
        }))
        setIsLoading(false)
    }
}

export const getSelectedClient = async (setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, userId: string) => {
    setIsLoading(true)
    const serviceProviderData = await axios.get(`/user/getClient/${userId}`)
    if (serviceProviderData.data.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: serviceProviderData.data.error,
        })
        setIsLoading(false)
        dispatch(saveSelectedClient(null))
    } else {
        dispatch(saveSelectedClient(serviceProviderData.data))
        setIsLoading(false)
    }
}

export const getSelectedModerator = async (setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, userId: string) => {
    setIsLoading(true)
    const moderatorData = await axios.get(`/user/getModerator/${userId}`)
    if (moderatorData.data.error) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: moderatorData.data.error,
        })
        setIsLoading(false)
        dispatch(saveSelectedModerator(null))
    } else {
        dispatch(saveSelectedModerator(moderatorData.data))
        setIsLoading(false)
    }
}

export const updateSelectedServiceProvider = (serviceProviderData: IUserProfile) => {
    dispatch(saveSelectedServiceProvidersFromSkills(serviceProviderData))
}
