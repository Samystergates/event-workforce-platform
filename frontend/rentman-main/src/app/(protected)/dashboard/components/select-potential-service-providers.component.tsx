"use client"
import React, { useMemo } from 'react';
import { ReactSortable } from "react-sortablejs";
import { isEmpty } from "lodash";
import ServiceProviderCard from "@/components/common/service-providers-card.component";
import { Controller } from "react-hook-form";
import { useAppSelector } from "@/redux/hooks";
import moment from "moment";
import { useSession } from "next-auth/react";
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
    control: any;
    numberOfPersons: number;
    setError: any;
    serviceProviderLoading: boolean;
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

const SelectPotentialServiceProvidersComponent = ({
    control,
    numberOfPersons,
    setError,
    serviceProviderLoading,
}: ComponentProps) => {
    const {
        serviceProviders,
        maybeServiceProviders,
        unknownServiceProviders,
        unAvailableServiceProviders,
        availableServiceProviders,
    } = useAppSelector((state) => state.user);
    const { data: session } = useSession();

    const departmentId = session?.user?.depId;

    const providerLookup = useMemo(() => {
        const map = new Map<number, ItemType>();
        const collect = (providers?: IUserProfile[]) => {
            providers?.forEach((provider) => {
                const item = toItem(provider);
                map.set(item.id, item);
            });
        };

        if (departmentId === 2) {
            collect(maybeServiceProviders);
            collect(unknownServiceProviders);
            collect(unAvailableServiceProviders);
            collect(availableServiceProviders);
        } else {
            collect(serviceProviders);
        }

        return map;
    }, [
        departmentId,
        serviceProviders,
        maybeServiceProviders,
        unknownServiceProviders,
        unAvailableServiceProviders,
        availableServiceProviders,
    ]);

    if (serviceProviderLoading) {
        return (
            <div className={"border border-dashed rounded flex items-center justify-center bg-gray-50 w-full h-[10em]"}>
                <p className={"text-gray-400"}>--- Laden ---</p>
            </div>
        );
    }

    return (
        <Controller
            name={"potential_service_providers"}
            control={control}
            render={({ field }) => {
                const rawValues = Array.isArray(field.value) ? (field.value as Array<number | string>) : [];
                const selectedItems = rawValues
                    .map((value) => {
                        const id = typeof value === "string" ? Number(value) : value;
                        return providerLookup.get(id);
                    })
                    .filter((item): item is ItemType => Boolean(item));

                return (
                    <ReactSortable
                        group={{ name: "service-providers", pull: true, put: true }}
                        list={selectedItems}
                        setList={(updatedList) => {
                            const ids = updatedList.map((value) => value.id);
                            field.onChange(ids);
                            if (numberOfPersons !== ids.length) {
                                const difference = numberOfPersons - ids.length;
                                setError("potential_service_providers", {
                                    type: "manual",
                                    message:
                                        difference > 0
                                            ? "Please select " + difference + " potential freelancer."
                                            : "Please remove " + Math.abs(difference) + " potential freelancer.",
                                });
                            } else {
                                setError("potential_service_providers", {
                                    type: "manual",
                                    message: undefined,
                                });
                            }
                        }}
                        className={"flex gap-2 w-full flex-wrap"}
                        animation={200}
                        delayOnTouchOnly
                        delay={2}
                    >
                        {!isEmpty(selectedItems) ? (
                            selectedItems.map((item) => (
                                <ServiceProviderCard key={item.id} item={item} />
                            ))
                        ) : (
                            <div className={"border border-dashed rounded flex items-center justify-center bg-gray-50 w-full h-[10em]"}>
                                <p className={"text-gray-400"}>--- Drag & Drop potentiele freelancersprofielen ---</p>
                            </div>
                        )}
                    </ReactSortable>
                );
            }}
        />
    );
};

export default SelectPotentialServiceProvidersComponent;
