import React from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";

type componentPropType = {
    triggerLabel: string
    dialogTitle: string
    dialogFooter?: React.ReactNode
    dialogBody: React.ReactNode
    triggerVariant?: any
    triggerClassName?: string
    contentClassName?: string
    customTrigger?: React.ReactNode
    customTitle?: React.ReactNode
    buttonRef?: React.MutableRefObject<HTMLButtonElement | undefined>
    customTitleClass?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const CommonDialogComponent = ({
                                   triggerLabel,
                                   dialogTitle,
                                   dialogFooter,
                                   dialogBody,
                                   triggerVariant,
                                   triggerClassName,
                                   contentClassName,
                                   customTrigger,
                                   customTitleClass,
                                   customTitle,
                                   buttonRef,
                                   open,
                                   onOpenChange,
                               }: componentPropType) => {
    let triggerElement: React.ReactNode;

    if (customTrigger) {
        if (React.isValidElement(customTrigger)) {
            const triggerReactElement = customTrigger as React.ReactElement<any> & { className?: string };
            triggerElement = React.cloneElement(triggerReactElement, {
                className: cn('text-sm font-medium', triggerReactElement.props.className, triggerClassName ?? ''),
                ref: buttonRef as any,
            });
        } else {
            triggerElement = (
                <span className={cn('text-sm font-medium', triggerClassName ?? '')}>
                    {customTrigger}
                </span>
            );
        }
    } else {
        triggerElement = (
            <Button
                type={'button'}
                ref={buttonRef as any}
                className={cn('text-sm font-medium', triggerClassName)}
                variant={triggerVariant}
            >
                {triggerLabel}
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {triggerElement as React.ReactElement}
            </DialogTrigger>
            <DialogContent className={cn('max-h-[90vh] rounded-md overflow-auto', contentClassName ?? '')}>
                <DialogHeader>
                    {customTitle ? customTitle : <DialogTitle className={customTitleClass}>{dialogTitle}</DialogTitle>}
                    {dialogBody}
                </DialogHeader>
                {dialogFooter && (
                    <DialogFooter>
                        {dialogFooter}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CommonDialogComponent;
