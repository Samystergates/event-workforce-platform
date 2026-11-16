"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactSortable } from "react-sortablejs";
import ServiceProviderCard from "@/components/common/service-providers-card.component";
import { isEmpty } from "lodash";
import { useAppSelector } from "@/redux/hooks";
import { IconsComponent } from "@/components/common/icons.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import { PotentialServiceProvider } from "@/interfaces/event.interfaces";
import EmptyComponent from "@/components/common/empty.component";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IUserProfile } from "@/interfaces/user.interfaces";

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
    profile_image?: string;
    rating?: number;
}

type ComponentProps = {
    serviceProviderLoading: boolean;
    selectedProviders?: PotentialServiceProvider[];
};

const computeAge = (dateOfBirth?: string | null): number => {
    if (!dateOfBirth) {
        return 0;
    }
    const birthDate = moment(dateOfBirth);
    if (!birthDate.isValid()) {
        return 0;
    }
    return moment().diff(birthDate, "years");
};

const toItem = (provider: IUserProfile): ItemType => ({
    id: provider.id,
    name: [provider.first_name ?? "", provider.last_name ?? ""].join(" ").trim(),
    email: provider.email,
    about: provider.about,
    contact: provider.contact ? String(provider.contact) : "",
    street: provider.street ?? "",
    zip: provider.zip ?? "",
    city: provider.city ?? "",
    age: computeAge(provider.date_of_birth),
    profile_image: provider.profile_image
        ? ((process.env.NEXT_PUBLIC_URL ?? "") + "/user/getUserProfileImage/" + provider.profile_image)
        : undefined,
    rating: provider.rating ?? 0,
});

const ListAllProvidersComponent = ({ serviceProviderLoading, selectedProviders }: ComponentProps) => {
    const {
        availableServiceProviders,
        unAvailableServiceProviders,
        unknownServiceProviders,
        maybeServiceProviders,
    } = useAppSelector((state) => state.user);
    const [available, setAvailable] = useState<ItemType[]>([]);
    const [unavailable, setUnavailable] = useState<ItemType[]>([]);
    const [unknown, setUnknown] = useState<ItemType[]>([]);
    const [maybe, setMaybe] = useState<ItemType[]>([]);
    const [searchText, setSearchText] = useState("");

    const selectedIds = useMemo(() => {
        const ids = new Set<number>();
        selectedProviders?.forEach((provider) => {
            ids.add(provider.service_provider_id);
        });
        return ids;
    }, [selectedProviders]);

    const mapProviders = useCallback((providers?: IUserProfile[]) => {
        return (providers ?? [])
            .filter((provider) => !selectedIds.has(provider.id))
            .map(toItem);
    }, [selectedIds]);

    useEffect(() => {
        setAvailable(mapProviders(availableServiceProviders));
        setUnavailable(mapProviders(unAvailableServiceProviders));
        setUnknown(mapProviders(unknownServiceProviders));
        setMaybe(mapProviders(maybeServiceProviders));
    }, [
        availableServiceProviders,
        unAvailableServiceProviders,
        unknownServiceProviders,
        maybeServiceProviders,
        mapProviders,
    ]);

    const filteredAvailable = useMemo(() => {
        const trimmed = searchText.toLowerCase();
        return available.filter((value) => value.name.toLowerCase().includes(trimmed));
    }, [searchText, available]);

    const filteredUnavailable = useMemo(() => {
        const trimmed = searchText.toLowerCase();
        return unavailable.filter((value) => value.name.toLowerCase().includes(trimmed));
    }, [searchText, unavailable]);

    const filteredUnknown = useMemo(() => {
        const trimmed = searchText.toLowerCase();
        return unknown.filter((value) => value.name.toLowerCase().includes(trimmed));
    }, [searchText, unknown]);

    const filteredMaybe = useMemo(() => {
        const trimmed = searchText.toLowerCase();
        return maybe.filter((value) => value.name.toLowerCase().includes(trimmed));
    }, [searchText, maybe]);

    const createListUpdater = (setter: React.Dispatch<React.SetStateAction<ItemType[]>>) => (updated: ItemType[]) => {
        setter((previous) => {
            const trimmed = searchText.trim().toLowerCase();
            if (!trimmed) {
                return [...updated];
            }

            const nextIds = new Set(updated.map((item) => item.id));
            const preserved = previous.filter((item) => {
                const matchesSearch = item.name.toLowerCase().includes(trimmed);
                return matchesSearch ? nextIds.has(item.id) : !nextIds.has(item.id);
            });

            const result = [...updated];
            preserved.forEach((item) => {
                if (!nextIds.has(item.id)) {
                    result.push(item);
                }
            });

            return result;
        });
    };

    if (serviceProviderLoading) {
        return (
            <HStackComponent className={"h-1/2 w-5/12 gap-1"}>
                <p>Laden</p> <IconsComponent.spinner className="h-5 w-5 animate-spin" />
            </HStackComponent>
        );
    }

    if (
        isEmpty(availableServiceProviders) &&
        isEmpty(unAvailableServiceProviders) &&
        isEmpty(unknownServiceProviders) &&
        isEmpty(maybeServiceProviders)
    ) {
        return (
            <div className={"h-1/2 w-full md:w-6/12"}>
                <EmptyComponent text={"No freelancers found on the selected dates!"} className={"h-1/2"} />
            </div>
        );
    }

    return (
        <div className={"h-full w-full md:w-6/12 max-h-[80vh] pt-4 overflow-auto"}>
            <Input type="search" placeholder="Search" value={searchText} onChange={(event) => setSearchText(event.target.value)} />

            <Badge variant="outline" className={"w-full p-2 my-2 rounded text-sm bg-primary text-white"}>Available aanbieders</Badge>
            <ReactSortable
                group={{ name: "service-providers", pull: true, put: true }}
                list={filteredAvailable}
                setList={createListUpdater(setAvailable)}
                className={"flex w-full mt-4 gap-2 " + (!isEmpty(filteredAvailable) ? "h-fit" : "h-1/2") + " flex-wrap"}
                animation={200}
                delayOnTouchOnly
                delay={2}
            >
                {!isEmpty(filteredAvailable) ? (
                    filteredAvailable.map((item) => <ServiceProviderCard key={item.id} item={item} />)
                ) : (
                    <div className={"border-dashed rounded flex items-center justify-center bg-gray-100 w-full h-full"}>
                        <p className={"text-gray-400"}>--- Potentiele aanbieders ---</p>
                    </div>
                )}
            </ReactSortable>

            <Badge variant="outline" className={"w-full p-2 my-2 rounded text-sm bg-primary text-white"}>Un-Available aanbieders</Badge>
            <ReactSortable
                group={{ name: "service-providers", pull: true, put: true }}
                list={filteredUnavailable}
                setList={createListUpdater(setUnavailable)}
                className={"flex w-full mt-4 gap-2 " + (!isEmpty(filteredUnavailable) ? "h-fit" : "h-1/2") + " flex-wrap"}
                animation={200}
                delayOnTouchOnly
                delay={2}
            >
                {!isEmpty(filteredUnavailable) ? (
                    filteredUnavailable.map((item) => <ServiceProviderCard key={item.id} item={item} />)
                ) : (
                    <div className={"border-dashed rounded flex items-center justify-center bg-gray-100 w-full h-full"}>
                        <p className={"text-gray-400"}>--- Potentiele aanbieders ---</p>
                    </div>
                )}
            </ReactSortable>

            <Badge variant="outline" className={"w-full p-2 my-2 rounded text-sm bg-primary text-white"}>Un-known aanbieders</Badge>
            <ReactSortable
                group={{ name: "service-providers", pull: true, put: true }}
                list={filteredUnknown}
                setList={createListUpdater(setUnknown)}
                className={"flex w-full mt-4 gap-2 " + (!isEmpty(filteredUnknown) ? "h-fit" : "h-1/2") + " flex-wrap"}
                animation={200}
                delayOnTouchOnly
                delay={2}
            >
                {!isEmpty(filteredUnknown) ? (
                    filteredUnknown.map((item) => <ServiceProviderCard key={item.id} item={item} />)
                ) : (
                    <div className={"border-dashed rounded flex items-center justify-center bg-gray-100 w-full h-full"}>
                        <p className={"text-gray-400"}>--- Potentiele aanbieders ---</p>
                    </div>
                )}
            </ReactSortable>

            <Badge variant="outline" className={"w-full p-2 my-2 rounded text-sm bg-primary text-white"}>Maybe aanbieders</Badge>
            <ReactSortable
                group={{ name: "service-providers", pull: true, put: true }}
                list={filteredMaybe}
                setList={createListUpdater(setMaybe)}
                className={"flex w-full mt-4 gap-2 " + (!isEmpty(filteredMaybe) ? "h-fit" : "h-1/2") + " flex-wrap"}
                animation={200}
                delayOnTouchOnly
                delay={2}
            >
                {!isEmpty(filteredMaybe) ? (
                    filteredMaybe.map((item) => <ServiceProviderCard key={item.id} item={item} />)
                ) : (
                    <div className={"border-dashed rounded flex items-center justify-center bg-gray-100 w-full h-full"}>
                        <p className={"text-gray-400"}>--- Potentiele aanbieders ---</p>
                    </div>
                )}
            </ReactSortable>
        </div>
    );
};

export default ListAllProvidersComponent;
