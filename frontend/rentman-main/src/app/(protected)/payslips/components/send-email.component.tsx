import React, {useCallback} from 'react';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {MdOutlineMailOutline} from "react-icons/md";
import CommonDialogComponent from "@/components/common/common-dialog.component";
import {useForm} from "react-hook-form";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import ControllerTextareaComponent from "@/components/forms/controller-textarea.component";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {DialogClose} from "@/components/ui/dialog";
import {sendEmail} from "@/redux/actions";

const SendEmailComponent = ({id}: {id: number}) => {
    const {
        handleSubmit,
        control,
        setValue,
        formState: {errors},
    } = useForm<any>({
        defaultValues: {
            cc: '',
            bcc: '',
            message: ''
        },
    })

    const onSubmit = useCallback(async (data: any) => {
        await sendEmail(id, data)
    }, [id])

    return (
        <CommonDialogComponent customTitleClass={"mb-6"} triggerLabel={"email"} dialogBody={
            <form onSubmit={handleSubmit(onSubmit)} className={"flex flex-col gap-4"}>
                <ControllerInputComponent control={control} errors={errors} inputName={"cc"} labelName={"CC"} />
                <ControllerInputComponent control={control} errors={errors} inputName={"cc"} labelName={"BCC"}/>
                <ControllerTextareaComponent inputName={"message"} control={control} errors={errors} labelName={"Message"} />
                <HStackComponent className={"justify-end gap-2"}>
                    <DialogClose>
                        <Button type={"button"} variant={"outline"} className={"px-8"}>Close</Button>
                    </DialogClose>
                    <Button type={"submit"} className={"px-8"}>Submit</Button>
                </HStackComponent>
            </form>
        } dialogTitle={"Send invoice via email"}  customTrigger={
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Button variant={"outline"}><MdOutlineMailOutline className={"w-6 h-6"}/></Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-4">
                    Send Via Email
                </TooltipContent>
            </Tooltip>
        } />
    );
};

export default SendEmailComponent;
