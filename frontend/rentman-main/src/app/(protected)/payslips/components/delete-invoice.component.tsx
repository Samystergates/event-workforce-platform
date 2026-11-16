"use client"
import React, {useRef, useState} from 'react';
import { RiDeleteBin6Line } from "react-icons/ri";
import {Button} from "@/components/ui/button";
import CommonDialogComponent from "@/components/common/common-dialog.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {DialogClose} from "@/components/ui/dialog";
import {IconsComponent} from "@/components/common/icons.component";
import {IEvent} from "@/interfaces/event.interfaces";
import {axios} from "@/lib/axiosInstance";
import {getAllJobs, resetInvoices} from "@/redux/actions";

const DeleteInvoiceComponent = ({selectedEvent, customTrigger, afterDelete}: {selectedEvent: IEvent, customTrigger?: React.ReactNode, afterDelete?: () => void}) => {
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
    const cancelRef = useRef<HTMLButtonElement>(null)

    const handleDelete = async () => {
        setDeleteLoading(true)
        await axios(`/job/delete-job/${selectedEvent.id}`)
        if (cancelRef.current) {
            cancelRef.current.click()
        }
        resetInvoices()
        getAllJobs().then(null)
        setDeleteLoading(false)
        afterDelete && afterDelete()
    }

    return (
        <CommonDialogComponent
            triggerLabel={""}
            dialogTitle={"Weet je het zeker"}
            customTrigger={customTrigger ? customTrigger : (
                <Button variant={"outline"}>
                    <RiDeleteBin6Line className={"text-red-700"}/>
                </Button>
            )}
            dialogBody={
            <div>
                <p className={"text-sm mb-7"}>U kunt deze actie niet ongedaan maken. Wilt u deze factuur toch verwijderen?</p>
                <HStackComponent className={"justify-end flex-row"}>
                    <DialogClose>
                        <Button ref={cancelRef} variant={"outline"}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleDelete} className={"bg-red-700 text-white hover:bg-red-600"}>
                        Verwijderen {deleteLoading && <IconsComponent.spinner className="h-4 w-4 ml-1.5 animate-spin"/>}
                    </Button>
                </HStackComponent>
            </div>
            }
        />
    );
};

export default DeleteInvoiceComponent;
