import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {isEmpty} from "lodash";
import EmptyComponent from "@/components/common/empty.component";
import VStackComponent from "@/components/common/vertical-stack.component";
import {actionEvents, downLoadPdf, getInvoice, resetInvoices, updateInvoice} from "@/redux/actions";
import {useAppSelector} from "@/redux/hooks";
import ThemeTableComponent from "@/components/table/theme-table.component";
import TableBackNextBtnComponent from "@/components/table/table-back-next-btn.component";
import useAuthRequest from "@/lib/useAuthRequest";
import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState
} from "@tanstack/react-table";
import {useSession} from "next-auth/react";
import {IEvent, IInvoices, Invoice} from "@/interfaces/event.interfaces";
import moment from "moment/moment";
import {Badge} from "@/components/ui/badge";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button, buttonVariants} from "@/components/ui/button";
import {IconsComponent} from "@/components/common/icons.component";
import DeleteInvoiceComponent from "@/app/(protected)/invoices/components/delete-invoice.component";
import {BsCalendar4Event} from "react-icons/bs";
import { PiFilePdfDuotone } from "react-icons/pi";
import { MdOutlineMailOutline } from "react-icons/md";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import Link from "next/link";
import {cn} from "@/lib/utils";
import CommonDialogComponent from "@/components/common/common-dialog.component";
import SendEmailComponent from "@/app/(protected)/invoices/components/send-email.component";
import {useForm} from "react-hook-form";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import {RiDeleteBin6Line} from "react-icons/ri";
import {number} from "yup";
import {convertNumbersToFloat} from "@/util/common";
import PreviewInvoiceComponent from "@/components/common/preview-invoice.component";
import ControlDateSelectorComponent from "@/components/forms/control-date-selector.component";

const InvoiceTableComponent = ({selectedEvent, completeInvoice}: {selectedEvent: IEvent, completeInvoice?: IInvoices}) => {
    useAuthRequest()
    const [invoicesLoading, setInvoicesLoading] = useState<boolean>(false)
    const [pdfDownloadLoading, setPdfDownloadLoading] = useState<boolean>(false)
    const [invoiceLinesNumber, setInvoiceLinesNumber] = useState(0)
    const [isDisabled, setIsDisabled] = useState(false)
    const [invoiceLines, setInvoiceLines] = useState<{
        "id"?: number,
        "aantal": number,
        "omschrijving": string,
        "price": number
    }[]>([])
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false)
    const total = useMemo(() => invoiceLines?.reduce((prev, value) => prev + (value.aantal * value.price) || 0, 0),[invoiceLines])
    const totalTax = useMemo(() => total * 0.21,[total])

    const {
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: {errors},
    } = useForm<any>({
        defaultValues: {
            invoiceLines: [],
            invoiceDate: completeInvoice?.invoiceDate?.join('-')
        },
    })

    useEffect(() => {
        if (selectedEvent.id !== 0) {
            setIsDisabled(false)
            getInvoice(selectedEvent.id, setInvoicesLoading).then(null)
        } else {
            resetInvoices()
        }
    }, [selectedEvent]);

    useEffect(() => {
        setValue("invoiceLines", completeInvoice?.invoiceLines || [])
        setValue("invoiceDate", completeInvoice?.invoiceDate?.join('-'))
        setInvoiceLines(completeInvoice?.invoiceLines || [])
        setInvoiceLinesNumber(completeInvoice?.invoiceLines?.length || 0)
    }, [completeInvoice]);

    const updateUseState = useCallback((val: string | number, key: string, index: number) => {
        setInvoiceLines(prevState => prevState.map((state, position) => {
            if (position === index){
                return ({
                    ...state,
                    [key]: val
                })
            }

            return state
        }))
    }, [invoiceLines])

    const onSubmit = useCallback(async (values: any, afterSubmit?: () => void) => {
        setIsDisabled(true)
        if (completeInvoice) {
            const dataSubmitted = convertNumbersToFloat({
                ...completeInvoice,
                invoiceLines: values.invoiceLines,
                invoiceDate: values.invoiceDate.split('-').map((value: any) => Number(value))
            });
            const status = await updateInvoice(completeInvoice?.id || 0, dataSubmitted)
            if (status) {
                afterSubmit && afterSubmit()
            }
        }
    }, [completeInvoice])

    const handlePdf = useCallback(async () => {
        await downLoadPdf(completeInvoice?.id || 0, setPdfDownloadLoading)
    }, [completeInvoice])

    if (!completeInvoice && !invoicesLoading) {
        return (
            <div className={'h-full overflow-auto border rounded p-4 w-full md:w-[70%] gap-2'}>
                <h1 className={"text-xl font-bold"}>Invoices</h1>
                <VStackComponent className={"h-[95%]"}>
                    <EmptyComponent text={selectedEvent.id === 0 ? 'Event not selected yet' : 'No invoices found'}/>
                </VStackComponent>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <form onSubmit={handleSubmit((e) => onSubmit(e))} className={'h-full flex flex-col overflow-auto border rounded p-4 w-full md:w-[70%] gap-2'}>
                <div>
                    <HStackComponent className={"w-full justify-between"}>
                        <h1 className={"text-xl font-bold"}>{selectedEvent.title}</h1>
                        <HStackComponent className={"w-fit gap-2"}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button onClick={handlePdf} type={"button"} variant={"outline"}>
                                        {pdfDownloadLoading ? (
                                            <IconsComponent.spinner className="h-6 w-6 animate-spin"/>
                                        ) : (
                                            <PiFilePdfDuotone className={"w-6 h-6"}/>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="flex items-center gap-4">
                                    Download PDF
                                </TooltipContent>
                            </Tooltip>
                            <SendEmailComponent id={completeInvoice?.id || 0}/>
                        </HStackComponent>
                    </HStackComponent>
                    <p className={"text-sm"}>{selectedEvent.description}</p>
                    <HStackComponent className={"justify-start mt-4 gap-6"}>
                        <div className={"min-w-40"}>
                            {/*<p className={"text-sm mb-1"}>Dates</p>*/}
                            {/*<div*/}
                            {/*    className={"flex gap-3 border border-gray-300 bg-gray-50 items-center justify-center p-2 py-1 rounded"}>*/}
                            {/*    <p className={"text-sm min-w-32"}>*/}
                            {/*        {moment(completeInvoice?.invoiceDate?.join('-')).format('DD/MM/YYYY')}*/}
                            {/*    </p>*/}
                            {/*    <BsCalendar4Event className="h-4 w-4"/>*/}
                            {/*</div>*/}
                            <ControlDateSelectorComponent
                                disabled={isDisabled}
                                onChange={(e) => {
                                    setValue('invoiceDate', moment(e, 'YYYY-MM-DD').format('YYYY-MM-DD'))
                                }}
                                placeholder='Select date... '
                                errors={errors} control={control} inputName={'invoiceDate'}
                                labelName={'Dates'}/>
                        </div>
                    </HStackComponent>
                </div>
                <HStackComponent className={"gap-2 mt-6"}>
                    <p className={"w-[10%] text-sm text-gray-500"}>Antal</p>
                    <p className={"w-[60%] text-sm text-gray-500"}>Omschrijving</p>
                    <HStackComponent className={"w-[15%]"}>
                        <p className={"text-sm text-gray-500"}>Prijs</p>
                        <p className={"text-sm text-gray-500"}>Excl.btw</p>
                    </HStackComponent>
                    <HStackComponent className={"w-[15%]"}>
                        <p className={"w-full text-sm text-gray-500 text-end"}>Totaal</p>
                        <div className={"w-5"}/>
                    </HStackComponent>
                </HStackComponent>
                <div className={"flex flex-col gap-2"}>
                    {Array.from({ length: invoiceLinesNumber }, (_, i) => i).map(value => (
                        <HStackComponent key={value} className={"gap-2"}>
                            <ControllerInputComponent disabled={isDisabled} onChangeHandler={e => updateUseState(Number(e.target.value), 'aantal', value)} inputName={`invoiceLines[${value}].aantal`} control={control} errors={errors} mainContainerClass={"w-[10%]"}/>
                            <ControllerInputComponent disabled={isDisabled} onChangeHandler={e => updateUseState(e.target.value, 'omschrijving', value)} inputName={`invoiceLines[${value}].omschrijving`} control={control} errors={errors} mainContainerClass={"w-[60%]"}/>
                            <ControllerInputComponent disabled={isDisabled} onChangeHandler={e => updateUseState(Number(e.target.value), 'price', value)} inputName={`invoiceLines[${value}].price`} control={control} errors={errors} mainContainerClass={"w-[15%]"}/>
                                <HStackComponent className={"w-[15%]"}>
                                    <p className={"w-full text-sm text-gray-500 border-b border-input py-2 text-end"}>{(invoiceLines[value]?.aantal || 0) * (invoiceLines[value]?.price || 0)}</p>
                                    <Button type={"button"} onClick={() => {
                                        setInvoiceLines(prevState => {
                                            const deletedInvoiceLines = prevState.filter((_, i) => i !== value)
                                            deletedInvoiceLines.map((lines, key) => {
                                                setValue(`invoiceLines[${key}]`, lines)
                                            })
                                            setValue(`invoiceLines[${deletedInvoiceLines.length}]`, undefined)
                                            return deletedInvoiceLines
                                        })
                                        setInvoiceLinesNumber(invoiceLinesNumber - 1)
                                    }} variant={"ghost"} className={"w-5 h-5 p-0"}>
                                        <RiDeleteBin6Line className={"h-4 w-4 text-red-700"}/>
                                    </Button>
                                </HStackComponent>
                        </HStackComponent>
                    ))}
                    {!isDisabled ? (
                        <Button type={"button"} variant={"ghost"} className={"gap-4 w-full mt-2"} onClick={() => {
                            setInvoiceLinesNumber(prevState => prevState + 1)
                            setInvoiceLines(prevState => [...prevState, {
                                "aantal": 0,
                                "omschrijving": '',
                                "price": 0
                            }])
                        }}>
                            <p className={"text-blue-500"}>
                                {"<"}
                            </p>
                            <div className={"border-dashed border-b border-blue-500 w-[inherit] h-px"}/>
                            <p className={"text-blue-500"}>Add</p>
                            <div className={"border-dashed border-b border-blue-500 w-[inherit] h-px"}/>
                            <p className={"text-blue-500"}>
                                {">"}
                            </p>
                        </Button>
                    ) : null}
                    <HStackComponent className={"justify-end text-sm mt-4"}>
                        <p>Totale kosten:</p>
                        <div className={"border rounded-t-md w-1/6 p-2 flex justify-end"}>
                            <p>€ {total?.toFixed(2)}</p>
                        </div>
                    </HStackComponent>
                    <HStackComponent className={"justify-end -mt-2 text-sm"}>
                        <p>VAT (21%):</p>
                        <div
                            className={"border border-t-0 w-1/6 p-2 rounded-md !rounded-t-none !rounded-b-none flex justify-end"}>
                            <p>€ {totalTax.toFixed(2)}</p>
                        </div>
                    </HStackComponent>
                    <HStackComponent className={"justify-end -mt-2 text-sm"}>
                        <p>Totale kosten (VAT):</p>
                        <div
                            className={"border border-t-0 w-1/6 p-2 rounded-md !rounded-t-none flex justify-end"}>
                            <p>€ {(totalTax + total).toFixed(2)}</p>
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
                        <Button type={"button"} onClick={handleSubmit((e) => onSubmit(e, () => setOpenInvoiceModal(true)))}>Bekjik voorbeeld factuur</Button>
                    </HStackComponent>
                    <HStackComponent className={"w-fit"}>
                        <Button type={"button"} variant={"outline"}>
                            Afronden
                        </Button>
                        <Button onClick={() => setIsDisabled(false)} type={"button"}>
                            Terug
                        </Button>
                    </HStackComponent>
                </div>
            </form>
            <PreviewInvoiceComponent setOpenDialog={setOpenInvoiceModal} openDialog={openInvoiceModal}/>
        </TooltipProvider>
    );
};

export default InvoiceTableComponent;
