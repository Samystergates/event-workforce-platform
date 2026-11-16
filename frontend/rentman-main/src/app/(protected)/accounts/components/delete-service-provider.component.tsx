import React, {useRef, useState} from 'react';
import {IUserProfile} from "@/interfaces/user.interfaces";
import {Button} from "@/components/ui/button";
import {axios} from "@/lib/axiosInstance";
import {getAllJobs, resetInvoices} from "@/redux/actions";
import CommonDialogComponent from "@/components/common/common-dialog.component";
import {RiDeleteBin6Line} from "react-icons/ri";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {DialogClose} from "@/components/ui/dialog";
import {IconsComponent} from "@/components/common/icons.component";
import useAuthRequest from "@/lib/useAuthRequest";
import {toast} from "@/components/ui/use-toast";

const DeleteServiceProviderComponent = ({serviceProvider, handleRefresh}: {serviceProvider: IUserProfile, handleRefresh: () => void}) => {
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
    const cancelRef = useRef<HTMLButtonElement>(null)
    useAuthRequest()

    const handleDelete = async () => {
        setDeleteLoading(true)
        const res = await axios.delete(`/user/admin/usermanagement/${serviceProvider.id}`)
        if (res.data.success) {
            if (cancelRef.current) {
                cancelRef.current.click()
            }
            handleRefresh()
            setDeleteLoading(false)
        }

        setDeleteLoading(false)
    }

    return (
        <CommonDialogComponent
            triggerLabel={""}
            dialogTitle={"Weet je het zeker"}
            customTrigger={
                <Button variant={"outline"}>
                    <RiDeleteBin6Line className={"text-red-700"}/>
                </Button>
            }
            dialogBody={
                <div>
                    <p className={"text-sm mb-7"}>U kunt deze actie niet ongedaan maken. Wil je dit profiel toch verwijderen?</p>
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

export default DeleteServiceProviderComponent;
