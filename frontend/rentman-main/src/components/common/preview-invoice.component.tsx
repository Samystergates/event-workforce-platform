"use client"

import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaRegFilePdf } from "react-icons/fa6";
import { useAppSelector } from "@/redux/hooks";
import { downLoadPdf, getInvoicePdf } from "@/redux/actions";
import { IconsComponent } from "@/components/common/icons.component";
import HStackComponent from "@/components/common/horizontal-stack.component";

type PreviewInvoiceProps = {
    openDialog: boolean;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
    invoiceIdOverride?: number;
};

const PreviewInvoiceComponent = ({
    setOpenDialog,
    openDialog,
    invoiceIdOverride,
}: PreviewInvoiceProps) => {
    const [pdfDownloadLoading, setPdfDownloadLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(false);
    const { invoice } = useAppSelector((state) => state.events);
    const invoiceId = invoiceIdOverride ?? invoice?.id;
    const [invoicePdf, setInvoicePdf] = useState<string>("");

    useEffect(() => {
        if (!openDialog || !invoiceId) {
            return;
        }

        getInvoicePdf(invoiceId, setPageLoading, setInvoicePdf).then(null);
    }, [openDialog, invoiceId]);

    const handlePdf = useCallback(async () => {
        if (!invoiceId) {
            return;
        }

        await downLoadPdf(invoiceId, setPdfDownloadLoading);
    }, [invoiceId]);

    return (
        <Dialog open={openDialog}>
            <DialogContent
                setOpenDialog={setOpenDialog}
                className="max-w-[90%] sm:max-w-[65%] md:max-w-[65%] max-h-[90vh] rounded-md overflow-auto p-0 border-none"
            >
                <div className="min-w-[40em] min-h-[60rem]">
                    {pageLoading ? (
                        <HStackComponent className="gap-1 min-h-[60rem]">
                            <p>Laden</p>
                            <IconsComponent.spinner className="h-4 w-4 animate-spin" />
                        </HStackComponent>
                    ) : (
                        <>
                            <iframe src={invoicePdf} className="w-full h-full rounded" frameBorder="0">
                                This browser does not support PDFs. Please download the PDF to view it.
                            </iframe>
                            <div className="absolute bottom-4 right-4 rounded-md bg-white">
                                <Button
                                    onClick={handlePdf}
                                    variant="ghost"
                                    disabled={!invoiceId || pdfDownloadLoading}
                                    className="flex items-center justify-center gap-1"
                                >
                                    {pdfDownloadLoading ? (
                                        <IconsComponent.spinner className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <FaRegFilePdf className="h-7 w-6 text-red-800" />
                                    )}
                                    <p className="text-red-800">Download PDF</p>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PreviewInvoiceComponent;
