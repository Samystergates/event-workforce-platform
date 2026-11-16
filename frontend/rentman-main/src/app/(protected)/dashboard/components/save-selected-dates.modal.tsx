"use client"
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {isEmpty} from "lodash";
import {Label} from "@/components/ui/label";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Controller, useForm} from "react-hook-form";
import CommonSelectComponent from "@/components/common/common-select.component";
import {IconsComponent} from "@/components/common/icons.component";
import VStackComponent from "@/components/common/vertical-stack.component";
import {yupResolver} from "@hookform/resolvers/yup";
import moment from "moment/moment";
import {mixed, object, string} from "yup";
import ControlDateSelectorComponent from "@/components/forms/control-date-selector.component";
import {DialogClose} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {axios} from "@/lib/axiosInstance";
import {getSelectedServiceProviders, updateSelectedServiceProvider} from "@/redux/actions";
import {useAppSelector} from "@/redux/hooks";
import {toast} from "@/components/ui/use-toast";
import useAuthRequest from "@/lib/useAuthRequest";
import {useSession} from "next-auth/react";
import {findMatchingDates, getDatesBetween, getFormatedDatesBetween} from "@/util/common";

const availabilitySchema = object().shape({
    dateSelectionType: string().required('Dit veld is verplicht.'),
    start_date: mixed().required('Dit veld is verplicht.'),
    end_date: mixed().required('Dit veld is verplicht.')
});

const optionForType = [
    {value: 'Available', label: 'Available'},
    {value: 'Unavailable', label: 'Unavailable'},
    {value: 'Unknown', label: 'Unknown'}
]

type componentPropType = {
    setSelectOption: (value: string) => void
    selectOption: string
    selectionRange: { startDate: Date, endDate: Date }
}

const SaveSelectedDatesModal = ({setSelectOption, selectOption, selectionRange}: componentPropType) => {
    useAuthRequest()
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
    const buttomRef = useRef<HTMLButtonElement | null>(null);
    const {selectedServiceProviders} = useAppSelector(state => state.skills);
    const {data: session} = useSession()
    const availabilitySpecialDay = useMemo(() => selectedServiceProviders?.availability_dates || [], [selectedServiceProviders])
    const unavailableSpecialDay = useMemo(() => selectedServiceProviders?.unavailability_dates || [], [selectedServiceProviders])
    const unknownSpecialDay = useMemo(() => selectedServiceProviders?.unknown_dates || [], [selectedServiceProviders])

    useEffect(() => {
        const fetchSkills = async () => {
            if (session) {
                const {user} = session
                await getSelectedServiceProviders(setLoadingProfile, `${user.id}`)
            }
        }

        fetchSkills().then(null)
    }, [session?.user.id]);

    const {
        handleSubmit,
        control,
        formState: {errors},
    } = useForm<any>({
        resolver: yupResolver(availabilitySchema),
        defaultValues: {
            dateSelectionType: '',
            start_date: selectionRange.startDate,
            end_date: selectionRange.endDate,
        },
    })

    const handleSaveAvailability = async (data: any) => {
        const {start_date, end_date, dateSelectionType} = data
        setIsLoading(true)
        let dataToSave: any
        if (dateSelectionType === 'Available') {
            const availability_start = [...availabilitySpecialDay, ...getFormatedDatesBetween(start_date, end_date)]
            dataToSave = {
                availability_dates: [...new Set(availability_start)],
                unavailability_dates: unavailableSpecialDay.filter(value => !([...new Set(availability_start)].includes(value))),
                unknown_dates: unknownSpecialDay.filter(value => !([...new Set(availability_start)].includes(value)))
            }
        } else if (dateSelectionType === 'Unavailable') {
            const unavailability_start = [...unavailableSpecialDay, ...getFormatedDatesBetween(start_date, end_date)]
            dataToSave = {
                unavailability_dates: [...new Set(unavailability_start)],
                availability_dates: availabilitySpecialDay.filter(value => !([...new Set(unavailability_start)].includes(value))),
                unknown_dates: unknownSpecialDay.filter(value => !([...new Set(unavailability_start)].includes(value)))
            }
        } else {
            const unknown_start = [...unknownSpecialDay, ...getFormatedDatesBetween(start_date, end_date)]
            dataToSave = {
                unknown_dates: [...new Set(unknown_start)],
                unavailability_dates: unavailableSpecialDay.filter(value => !([...new Set(unknown_start)].includes(value))),
                availability_dates: availabilitySpecialDay.filter(value => !([...new Set(unknown_start)].includes(value))),
            }
        }

        const serviceProvidersValues = {
            id: selectedServiceProviders?.id,
            email: selectedServiceProviders?.email,
            ...dataToSave
        }
        const signupData = await axios.post('/user/updateServiceProvider', serviceProvidersValues)
        if (signupData.data.id) {
            toast({
                description: "Profile updated successfully",
            })
            updateSelectedServiceProvider({
                ...selectedServiceProviders as any,
                ...dataToSave
            })
            setIsLoading(false)
            buttomRef?.current?.click()
        } else {
            setIsLoading(false)
        }
    }

    if (loadingProfile) {
        return (
            <VStackComponent>
                <div className={'h-px bg-gray-300 mt-1 rounded-full w-full'}/>
                <HStackComponent className={'h-32 w-full gap-1'}>
                    <p>Laden</p> <IconsComponent.spinner className="h-4 w-4 animate-spin"/>
                </HStackComponent>
            </VStackComponent>
        )
    }

    if (isEmpty(selectOption)) {
        return (
            <VStackComponent>
                <div className={'h-px bg-gray-300 mt-1 rounded-full w-full'}/>
                <HStackComponent>
                    {/*<button className={'w-full h-32 items-center justify-center flex border rounded-md'}>*/}
                    {/*    <p className={'font-bold opacity-75'}>Appointment</p>*/}
                    {/*</button>*/}
                    <button onClick={() => setSelectOption('Availability')}
                            className={'w-full h-32 items-center justify-center flex border rounded-md'}>
                        <p className={'font-bold opacity-75'}>Beschikbaarheid</p>
                    </button>
                </HStackComponent>
            </VStackComponent>
        )
    }

    return (
        <form>
            <div className={'h-px bg-gray-300 my-1 mb-4 rounded-full w-full'}/>
            <VStackComponent>
                <VStackComponent className={'items-start'}>
                    <Label htmlFor={'Skills'} className="text-left">
                        Beschikbaarheid
                    </Label>
                    <Controller
                        name={'dateSelectionType'}
                        control={control}
                        render={({field}) => (
                            <CommonSelectComponent
                                placeholder={'Beschikbaarheidstype selecteren...'}
                                onChange={field.onChange}
                                selectedValue={field.value}
                                selectOption={optionForType}
                            />
                        )}
                    />
                    {errors['dateSelectionType'] && errors['dateSelectionType']?.message &&
                        <span className={"text-errorText text-sm -mt-2 font-bold"}>
                            {errors['dateSelectionType']?.message as never}
                        </span>
                    }
                </VStackComponent>
                <HStackComponent className={'items-start'}>
                    <ControlDateSelectorComponent
                        placeholder='Kies startdatum...'
                        errors={errors} control={control} inputName={'start_date'}
                        labelName={'Start date'}/>
                    <ControlDateSelectorComponent
                        placeholder='Einddatum kiezen...'
                        errors={errors} control={control} inputName={'end_date'}
                        labelName={'End date'}/>
                </HStackComponent>
            </VStackComponent>
            <div className={'h-px bg-gray-300 my-4 rounded-full w-full'}/>
            <HStackComponent className={'justify-end'}>
                <DialogClose asChild>
                    <Button ref={buttomRef} type="button" variant="secondary">
                        Dichtbij
                    </Button>
                </DialogClose>
                <Button type={'button'} disabled={isLoading} className={'w-4/12'}
                        onClick={handleSubmit(handleSaveAvailability)}>
                    {isLoading && (
                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                    )}
                    Redden
                </Button>
            </HStackComponent>
        </form>
    );
};

export default SaveSelectedDatesModal;
