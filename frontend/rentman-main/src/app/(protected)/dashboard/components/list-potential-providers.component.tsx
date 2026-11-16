"use client"
import React, {useEffect, useMemo, useState} from 'react';
import {ReactSortable} from "react-sortablejs";
import ServiceProviderCard from "@/components/common/service-providers-card.component";
import {isEmpty, isUndefined} from "lodash";
import {useAppSelector} from "@/redux/hooks";
import {IconsComponent} from "@/components/common/icons.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {PotentialServiceProvider} from "@/interfaces/event.interfaces";
import EmptyComponent from "@/components/common/empty.component";
import moment from "moment";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";

interface ItemType {
    id: number;
    name: string;
    email: string;
    about: string;
    contact: string;
    street: string;
    zip: string;
    city: string;
    age: number;
    profile_image?: string
    rating?: number,
}

type componentPropType = {
    serviceProviderLoading: boolean,
    selectedProviders?: PotentialServiceProvider[]
}

const ListPotentialProvidersComponent = ({serviceProviderLoading, selectedProviders}: componentPropType) => {
    const {serviceProviders} = useAppSelector(state => state.user)
    const [state, setState] = useState<ItemType[]>([]);
    const [searchText, setSearchText] = useState('')
    const filteredProviders = useMemo(() => {
        return state.filter(value => value.name.toLowerCase().includes(searchText.toLowerCase()))
    }, [searchText, state])

    useEffect(() => {
        let stateInfo: ItemType[] = []
        if (selectedProviders) {
            stateInfo = serviceProviders.filter(provider => isUndefined(selectedProviders.find(value => value.service_provider_id === provider.id))).map(value => ({
                id: value.id,
                name: `${value.first_name} ${value.last_name}`,
                age: Number(moment().format('YYYY')) - Number(moment(new Date(value?.date_of_birth ?? '')).format('YYYY')),
                email: value.email,
                about: value.about,
                street: value.street ?? '',
                zip: value.zip ?? '',
                city: value.city ?? '',
                contact: `${value.contact}`,
                rating: value.rating ?? 0,
                profile_image: value.profile_image ? `${process.env.NEXT_PUBLIC_URL}/user/getUserProfileImage/${value.profile_image}` : undefined
            }))
        } else {
            stateInfo = serviceProviders.map(value => ({
                id: value.id,
                name: `${value.first_name ?? ''} ${value.last_name ?? ''}`,
                email: value.email,
                about: value.about,
                street: value.street ?? '',
                zip: value.zip ?? '',
                city: value.city ?? '',
                contact: `${value.contact}`,
                rating: value.rating ?? 0,
                age: Number(moment().format('YYYY')) - Number(moment(new Date(value?.date_of_birth ?? '')).format('YYYY')),
                profile_image: value.profile_image ? `${process.env.NEXT_PUBLIC_URL}/user/getUserProfileImage/${value.profile_image}` : undefined
            }))
        }
        setState(stateInfo)
    }, [selectedProviders, serviceProviders])

    if (serviceProviderLoading) {
        return (
            <HStackComponent className={'h-full w-5/12 gap-1'}>
                <p>Laden</p> <IconsComponent.spinner className="h-5 w-5 animate-spin"/>
            </HStackComponent>
        )
    }

    if (isEmpty(serviceProviders)) {
        return (
            <div className={'h-full w-full md:w-6/12'}>
                <EmptyComponent text={'No freelancers found on the selected dates!'} className={'h-full'}/>
            </div>

        )
    }

    return (
        <div className={'h-full w-full md:w-6/12 max-h-[80vh] overflow-auto'}>
            <Input type={"search"} placeholder={"Search"} value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
            <Badge variant={"outline"} className={'w-full p-2 mb-2 rounded text-sm bg-primary text-white'}>Available aanbieders</Badge>
            <ReactSortable group="service-providers" list={filteredProviders} setList={setState} className={`flex w-full mt-4 gap-2 ${!isEmpty(filteredProviders) ? 'h-fit' : 'h-full'} flex-wrap`} animation={200} delayOnTouchOnly delay={2}>
                {!isEmpty(filteredProviders) ? filteredProviders.map((item) => (
                    <ServiceProviderCard key={item.id} item={item}/>
                )) : (
                    <div className={'border-dashed rounded flex items-center justify-center bg-gray-100 w-full h-full'}>
                        <p className={'text-gray-400'}>--- Potentiële aanbieders ---</p>
                    </div>
                )}
            </ReactSortable>
            <Badge variant={"outline"} className={'w-full p-2 mb-2 rounded text-sm bg-primary text-white'}>Un-Available aanbieders</Badge>
            <ReactSortable group="service-providers" list={filteredProviders} setList={setState} className={`flex w-full mt-4 gap-2 ${!isEmpty(filteredProviders) ? 'h-fit' : 'h-full'} flex-wrap`} animation={200} delayOnTouchOnly delay={2}>
                {!isEmpty(filteredProviders) ? filteredProviders.map((item) => (
                    <ServiceProviderCard key={item.id} item={item}/>
                )) : (
                    <div className={'border-dashed rounded flex items-center justify-center bg-gray-100 w-full h-full'}>
                        <p className={'text-gray-400'}>--- Potentiële aanbieders ---</p>
                    </div>
                )}
            </ReactSortable>
            <Badge variant={"outline"} className={'w-full p-2 mb-2 rounded text-sm bg-primary text-white'}>Un-known aanbieders</Badge>
            <ReactSortable group="service-providers" list={filteredProviders} setList={setState} className={`flex w-full mt-4 gap-2 ${!isEmpty(filteredProviders) ? 'h-fit' : 'h-full'} flex-wrap`} animation={200} delayOnTouchOnly delay={2}>
                {!isEmpty(filteredProviders) ? filteredProviders.map((item) => (
                    <ServiceProviderCard key={item.id} item={item}/>
                )) : (
                    <div className={'border-dashed rounded flex items-center justify-center bg-gray-100 w-full h-full'}>
                        <p className={'text-gray-400'}>--- Potentiële aanbieders ---</p>
                    </div>
                )}
            </ReactSortable>
            <Badge variant={"outline"} className={'w-full p-2 mb-2 rounded text-sm bg-primary text-white'}>Maybe aanbieders</Badge>
            <ReactSortable group="service-providers" list={filteredProviders} setList={setState} className={`flex w-full mt-4 gap-2 ${!isEmpty(filteredProviders) ? 'h-fit' : 'h-full'} flex-wrap`} animation={200} delayOnTouchOnly delay={2}>
                {!isEmpty(filteredProviders) ? filteredProviders.map((item) => (
                    <ServiceProviderCard key={item.id} item={item}/>
                )) : (
                    <div className={'border-dashed rounded flex items-center justify-center bg-gray-100 w-full h-full'}>
                        <p className={'text-gray-400'}>--- Potentiële aanbieders ---</p>
                    </div>
                )}
            </ReactSortable>
        </div>
    );
};

export default ListPotentialProvidersComponent;
