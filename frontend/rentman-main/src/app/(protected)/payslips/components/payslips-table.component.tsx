import React, {useCallback, useEffect, useMemo, useState} from 'react';
import EmptyComponent from "@/components/common/empty.component";
import VStackComponent from "@/components/common/vertical-stack.component";
import {downLoadPdf, updateInvoice} from "@/redux/actions";
import useAuthRequest from "@/lib/useAuthRequest";
import {IPurchaseOrder} from "@/interfaces/event.interfaces";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button} from "@/components/ui/button";
import { PiFilePdfDuotone } from "react-icons/pi";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import SendEmailComponent from "@/app/(protected)/invoices/components/send-email.component";
import {useForm} from "react-hook-form";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import {RiDeleteBin6Line} from "react-icons/ri";
import {convertNumbersToFloat} from "@/util/common";
import PreviewInvoiceComponent from "@/components/common/preview-invoice.component";
import {Input} from "@/components/ui/input";
import moment from "moment";
import ControlDateSelectorComponent from "@/components/forms/control-date-selector.component";

const PayslipsTableComponent = ({purchaseOrder}: {purchaseOrder?: IPurchaseOrder}) => {
    useAuthRequest()
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false)
    const [hoursWorked, setHoursWorked] = useState<number>(0)
    const [spRate, setSpRate] = useState<number>(0)

    const {
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: {errors},
    } = useForm<any>({
        defaultValues: {
            invoice: undefined
        },
    })

    useEffect(() => {
        if (purchaseOrder) {
            setValue("invoice", {...purchaseOrder, invoiceDate: purchaseOrder.invoiceDate.join('-')})
            setHoursWorked(purchaseOrder.hoursWorked || 0)
            setSpRate(purchaseOrder.spRate || 0)
        } else {
            setValue("invoice", undefined)
            setHoursWorked(0)
            setSpRate(0)
        }
    }, [purchaseOrder]);

    const onSubmit = useCallback(async (values: any, afterSubmit?: () => void) => {
        setIsDisabled(true)
        if (purchaseOrder) {
            const dataSubmitted = convertNumbersToFloat({
                ...purchaseOrder,
                ...values.invoice,
            });
            await updateInvoice(purchaseOrder?.id || 0, dataSubmitted)
        }
    }, [purchaseOrder])

    const handlePdf = useCallback(async () => {
        await downLoadPdf(purchaseOrder?.id || 0)
    }, [purchaseOrder])

    const handlePreviewClick = useCallback(() => {
        if (!purchaseOrder?.id) {
            return;
        }

        // Skip updateInvoice here; just show the preview modal and let it fetch the PDF
        setOpenInvoiceModal(true);
    }, [purchaseOrder])

    if (!purchaseOrder) {
        return (
            <div className={'h-full overflow-auto border rounded p-4 w-full md:w-[70%] gap-2'}>
                <h1 className={"text-xl font-bold"}>Invoices</h1>
                <VStackComponent className={"h-[95%]"}>
                    <EmptyComponent text={'No purchase order found'}/>
                </VStackComponent>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className={'h-full flex flex-col overflow-auto border rounded p-4 w-full md:w-[75%] gap-2'}>
                <div>
                    <HStackComponent className={"w-full justify-between"}>
                        <h1 className={"text-xl font-bold"}>{purchaseOrder?.serviceProvider.firstName} {purchaseOrder?.serviceProvider.lastName}</h1>
                        <HStackComponent className={"w-fit gap-2"}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button onClick={handlePdf} variant={"outline"}><PiFilePdfDuotone className={"w-6 h-6"}/></Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="flex items-center gap-4">
                                    Download PDF
                                </TooltipContent>
                            </Tooltip>
                            <SendEmailComponent id={purchaseOrder?.id || 0}/>
                        </HStackComponent>
                    </HStackComponent>
                    <p className={"text-sm"}>{purchaseOrder?.serviceProvider.about}</p>
                </div>
                <HStackComponent className={"gap-2 mt-6"}>
                    <p className={"w-[15%] text-sm text-gray-500"}>Leverdatum</p>
                    <p className={"w-[10%] text-sm text-gray-500"}>Antal</p>
                    <p className={"w-[10%] text-sm text-gray-500"}>Tareif</p>
                    <p className={"w-[20%] text-sm text-gray-500"}>Artikel Omschr.</p>
                    <p className={"w-[25%] text-sm text-gray-500"}>Omschrijving</p>
                    <p className={"w-[10%] text-sm text-gray-500 text-end"}>Projectnr.</p>
                    <p className={"w-[10%] text-sm text-gray-500 text-end"}>Totaal</p>
                </HStackComponent>
                {/* <form onSubmit={handleSubmit(onSubmit)} className={"flex flex-col gap-2"}> */}
                <form onSubmit={handleSubmit((e) => onSubmit(e))} className={"flex flex-col gap-2"}>
                    {Array.from({ length: 1 }, (_, i) => i).map(value => (
                        <HStackComponent key={value} className={"gap-2"}>
                            <ControlDateSelectorComponent
                                disabled={isDisabled}
                                onChange={(e) => {
                                    setValue('invoice.invoiceDate', moment(e, 'YYYY-MM-DD').format('YYYY-MM-DD'))
                                }}
                                placeholder='Select date... '
                                errors={errors} control={control} inputName={'invoice.invoiceDate'}
                                labelName={'Dates'} notShowLabel mainContainerClass={"w-[15%]"}/>
                            <ControllerInputComponent disabled={isDisabled}
                                                      inputName={`invoice.hoursWorked`} type={'number'} onChangeHandler={e => setHoursWorked(Number(e.target.value))} control={control}
                                                      errors={errors} mainContainerClass={"w-[10%]"}/>
                            <ControllerInputComponent disabled={isDisabled}
                                                      inputName={`invoice.spRate`} type={'number'} control={control} onChangeHandler={e => setSpRate(Number(e.target.value))}
                                                      errors={errors} mainContainerClass={"w-[10%]"}/>
                            {/*<ControllerInputComponent disabled={true}*/}
                            {/*                          inputName={`invoice.serviceProvider.skills[0].name`}*/}
                            {/*                          control={control} errors={errors} mainContainerClass={"w-[20%]"}/>*/}
                            <VStackComponent className={"items-start w-[20%]"}>
                                <Input disabled={true} value={purchaseOrder?.serviceProvider?.skills[0]?.name} />
                            </VStackComponent>
                            <ControllerInputComponent disabled={true}
                                                      inputName={`invoice.serviceProvider.firstName`}
                                                      control={control} errors={errors} mainContainerClass={"w-[25%]"}/>
                            <p className={"w-[10%] text-sm text-gray-500 border-b border-input py-2 text-end"}>INF{purchaseOrder?.job?.id}</p>
                            <p className={"w-[10%] text-sm text-gray-500 border-b border-input py-2 text-end"}>€ {hoursWorked * spRate}</p>
                        </HStackComponent>
                    ))}
                    {/*<Button type={"button"} variant={"ghost"} className={"gap-4 w-full mt-2"} onClick={() => {*/}
                    {/*    setInvoiceLinesNumber(prevState => prevState + 1)*/}
                    {/*    setInvoiceLines(prevState => [...prevState, {*/}
                    {/*        "aantal": 0,*/}
                    {/*        "omschrijving": '',*/}
                    {/*        "price": 0*/}
                    {/*    }])*/}
                    {/*}}>*/}
                    {/*    <p className={"text-blue-500"}>*/}
                    {/*        {"<"}*/}
                    {/*    </p>*/}
                    {/*    <div className={"border-dashed border-b border-blue-500 w-[inherit] h-px"}/>*/}
                    {/*    <p className={"text-blue-500"}>Add</p>*/}
                    {/*    <div className={"border-dashed border-b border-blue-500 w-[inherit] h-px"}/>*/}
                    {/*    <p className={"text-blue-500"}>*/}
                    {/*        {">"}*/}
                    {/*    </p>*/}
                    {/*</Button>*/}
                    <HStackComponent className={"justify-end text-sm mt-4"}>
                        <p>Totale kosten:</p>
                        <div className={"border rounded-t-md w-1/6 p-2 flex justify-end"}>
                            <p>€ {(hoursWorked * spRate).toFixed(2)}</p>
                        </div>
                    </HStackComponent>
                    <HStackComponent className={"justify-end -mt-2 text-sm"}>
                        <p>BTW bedrag:</p>
                        <div
                            className={"border border-t-0 w-1/6 p-2 rounded-md !rounded-t-none !rounded-b-none flex justify-end"}>
                            <p>€ 0.00</p>
                        </div>
                    </HStackComponent>
                    <HStackComponent className={"justify-end -mt-2 text-sm"}>
                        <p>Factuurbedrag:</p>
                        <div
                            className={"border border-t-0 w-1/6 p-2 rounded-md !rounded-t-none flex justify-end"}>
                            <p>€ {(hoursWorked * spRate).toFixed(2)}</p>
                        </div>
                    </HStackComponent>
                    <HStackComponent className={"justify-between mt-6"}>
                        <HStackComponent className={"w-fit"}>
                            <Button type={"submit"} variant={"outline"}>
                                Verder gaan
                            </Button>
                            <Button type={"button"}>
                                Bijlage bekijken
                            </Button>
                        </HStackComponent>
                        {/* <Button type={"button"} onClick={() => setOpenInvoiceModal(true)}>Bekjik voorbeeld factuur</Button> */}
                        <Button type={"button"} onClick={handlePreviewClick}>Bekjik voorbeeld factuur</Button>

                    </HStackComponent>
                    <HStackComponent className={"w-fit"}>
                        <Button type={"button"} variant={"outline"}>
                            Afronden
                        </Button>
                        <Button onClick={() => setIsDisabled(false)} type={"button"}>
                            Terug
                        </Button>
                    </HStackComponent>
                </form>
            </div>
            <PreviewInvoiceComponent setOpenDialog={setOpenInvoiceModal} openDialog={openInvoiceModal} invoiceIdOverride={purchaseOrder?.id}/>
        </TooltipProvider>
    );
};

export default PayslipsTableComponent;
