"use client"
import React, {useEffect, useState} from 'react';
import HStackComponent from "@/components/common/horizontal-stack.component";
import CommonSelectComponent from "@/components/common/common-select.component";
import {addDays} from "date-fns";
import {CalendarDateRangePicker} from "@/components/common/date-range-picker";
import {Controller, useForm} from "react-hook-form";
import VStackComponent from "@/components/common/vertical-stack.component";
import {IconsComponent} from "@/components/common/icons.component";
import {Button} from "@/components/ui/button";
import {yupResolver} from "@hookform/resolvers/yup";
import {isEmpty} from "lodash";
import moment from "moment/moment";
import {axios} from "@/lib/axiosInstance";
import {getSelectedServiceProviders, updateSelectedServiceProvider} from "@/redux/actions";
import {useAppSelector} from "@/redux/hooks";
import {useToast} from "@/components/ui/use-toast";
import useAuthRequest from "@/lib/useAuthRequest";

const EditProfileAvailabilityComponent = ({userId, startDate, setStartDate, endDate, setEndDate, onlyBtn, refreshHandler}: {userId: string, startDate: Date, endDate: Date, setStartDate: any, setEndDate: any, onlyBtn?: boolean, refreshHandler?: () => void}) => {
    useAuthRequest()
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
    const {selectedServiceProviders} = useAppSelector(state => state.skills);
    const [isCustom, setIsCustom] = useState<boolean>(false)
    const {toast} = useToast()

    useEffect(() => {
        const fetchSkills = async () => {
            await getSelectedServiceProviders(setLoadingProfile, userId)
        }

        fetchSkills().then(null)
    }, [userId]);

    const {
        handleSubmit,
        control,
        setValue,
        formState: {errors},
    } = useForm<any>({
        defaultValues: {
            availabilityRange: selectedServiceProviders?.availability_options ?? '',
        },
    })

    useEffect(() => {
        setValue('availabilityRange', selectedServiceProviders?.availability_options ?? '')
        setStartDate(selectedServiceProviders?.availability_start_date ? new Date(selectedServiceProviders?.availability_start_date ?? '') : new Date())
        setEndDate(selectedServiceProviders?.availability_end_date ? new Date(selectedServiceProviders?.availability_end_date ?? '') : new Date())
    }, [selectedServiceProviders]);

    const onSubmit = async (data: any) => {
        setIsLoading(true)

        const serviceProvidersValues = {
            id: selectedServiceProviders?.id,
            availability_start_date: moment(startDate).format('YYYY-MM-DD'),
            availability_end_date: moment(endDate).format('YYYY-MM-DD'),
            availability_options: data.availabilityRange,
        }

        const signupData = await axios.post('/user/updateServiceProvider', serviceProvidersValues)
        if (signupData.data.id) {
            toast({
                description: "Profile updated successfully",
            })
            updateSelectedServiceProvider({...selectedServiceProviders as any})
            setIsLoading(false)
        } else {
            setIsLoading(false)
            setValue('availabilityRange', selectedServiceProviders?.availability_options ?? '')
            setStartDate(selectedServiceProviders?.availability_start_date ? new Date(selectedServiceProviders?.availability_start_date ?? '') : new Date())
            setEndDate(selectedServiceProviders?.availability_end_date ? new Date(selectedServiceProviders?.availability_end_date ?? '') : new Date())
        }
    }

    if (loadingProfile) {
        return (
            <HStackComponent className={`${onlyBtn ? 'h-fit' : 'h-[10rem]'} w-full gap-1`}>
                <p>Laden</p> <IconsComponent.spinner className="h-4 w-4 animate-spin"/>
            </HStackComponent>
        )
    }

    if (onlyBtn) {
        return (
            <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col md:flex-row gap-4'}>
                <Button className="flex w-full" disabled={isLoading}>
                    {isLoading && (
                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                    )}
                    Beschikbaarheid bijwerken
                </Button>
                <Button variant={'outline'} type={"button"} onClick={refreshHandler} className="flex w-full" disabled={isLoading}>
                    {isLoading && (
                        <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                    )}
                    Vernieuwen
                </Button>
            </form>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name={'availabilityRange'}
                control={control}
                render={({field}) => (
                    <VStackComponent>
                        <CommonSelectComponent selectOption={[{value: 'WEEK', label: 'Week'}, {
                            value: 'MONTH',
                            label: 'Month'
                        }, {value: 'YEAR', label: 'Year'}, {value: 'CUSTOM', label: 'Custom'}]}
                                               placeholder={'Selecteer beschikbare dagen'} selectedValue={field.value}
                                               onChange={(value) => {
                                                   field.onChange(value)
                                                   const inputStartDateFilter = new Date()
                                                   const inputEndDateFilter = new Date()
                                                   setIsCustom(false)
                                                   if (value === 'MONTH') {
                                                       inputStartDateFilter.setDate(1)
                                                       setStartDate(inputStartDateFilter);
                                                       inputEndDateFilter.setDate(31);
                                                       inputEndDateFilter.setHours(24, 60, 60)
                                                       setEndDate(inputEndDateFilter)
                                                   } else if (value === 'WEEK') {
                                                       setStartDate(inputStartDateFilter)
                                                       const endDateSetTime = addDays(inputEndDateFilter, 7)
                                                       endDateSetTime.setHours(24, 60, 60)
                                                       setEndDate(endDateSetTime)
                                                   } else if (value === 'YEAR') {
                                                       inputStartDateFilter.setMonth(0, 1)
                                                       setStartDate(inputStartDateFilter);
                                                       inputEndDateFilter.setMonth(11, 31)
                                                       inputEndDateFilter.setHours(24, 60, 60)
                                                       setEndDate(inputEndDateFilter)
                                                   } else {
                                                       setIsCustom(true)
                                                   }
                                               }}/>
                        <CalendarDateRangePicker disabled={!isCustom} setEndDate={setEndDate}
                                                 setStartDate={setStartDate} startDate={startDate}
                                                 endDate={endDate}/>
                    </VStackComponent>
                )}/>
            <Button className="flex w-full my-4" disabled={isLoading}>
                {isLoading && (
                    <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                )}
                Beschikbaarheid bijwerken
            </Button>
        </form>
    );
};

export default EditProfileAvailabilityComponent;
