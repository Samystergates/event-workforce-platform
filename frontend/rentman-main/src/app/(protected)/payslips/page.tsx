"use client"
import React, { useEffect, useState } from 'react';
import VStackComponent from "@/components/common/vertical-stack.component";
import { IconsComponent } from "@/components/common/icons.component";
import { isEmpty } from "lodash";
import EmptyComponent from "@/components/common/empty.component";
import { useAppSelector } from "@/redux/hooks";
import {
    getAllInvoices,
    savePurchaseOrderAction
} from "@/redux/actions";
import useAuthRequest from "@/lib/useAuthRequest";
import HStackComponent from "@/components/common/horizontal-stack.component";
import moment from "moment";
import { Button } from "@/components/ui/button";
import PayslipsTableComponent from "@/app/(protected)/payslips/components/payslips-table.component";

const PurchaseOrder = () => {
    const [purchaseOrderLoading, setPurchaseOrderLoading] = useState(false)
    const { purchaseOrder, purchaseOrders } = useAppSelector(state => state.events)
    useAuthRequest()

    useEffect(() => {
        setPurchaseOrderLoading(true)
        getAllInvoices(setPurchaseOrderLoading).then()
    }, []);

    return (
        <HStackComponent className={'h-[87vh]'}>
            <div className={'h-full relative flex flex-col overflow-auto border rounded p-4 w-full md:w-[25%] gap-2'}>
                <HStackComponent className={"justify-between"}>
                    <h1 className={"text-xl font-bold"}>Payslips</h1>
                </HStackComponent>
                {purchaseOrderLoading && (
                    <VStackComponent className={'h-full'}>
                        <IconsComponent.spinner className="mr-2 h-6 w-6 animate-spin" />
                        <p className={'text-base'}>Loading Payslips</p>
                    </VStackComponent>
                )}
                {!purchaseOrderLoading && purchaseOrders.map((list, key) => (
                    <Button key={key} onClick={() => savePurchaseOrderAction(list)} variant={'outline'}
                        className={`flex items-start justify-start flex-col hover:bg-[#00000047] h-auto w-full ${purchaseOrder?.id === list.id ? 'border-green-700 border' : ''}`}>
                        <div className={"flex justify-between w-full gap-2"}>
                            <p className={'capitalize break-all whitespace-normal text-start font-bold'}>{list.serviceProvider.firstName} {list.serviceProvider.lastName}</p>
                        </div>
                        <div className={"flex justify-between items-center w-full"}>
                            <p>{moment(list.invoiceDate.join('-'), 'YYYY-MM-DD').format('DD/MM')}</p>
                        </div>
                    </Button>
                ))}
                {!purchaseOrderLoading && isEmpty(purchaseOrders) && (
                    <EmptyComponent text={'Geen evenementen gevonden!'} className={'h-full'} />
                )}
            </div>
            <PayslipsTableComponent purchaseOrder={purchaseOrder} />
        </HStackComponent>
    );
};

export default PurchaseOrder;
