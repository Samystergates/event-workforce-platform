// @flow
import React from "react";
import { FiInbox } from "react-icons/fi";
import {cn} from "@/lib/utils";

type Props = {
    className?: string;
    text: string
};
const EmptyComponent = ({ className, text }: Props) => {
    return (
        <div className={cn(
            "flex gap-4 items-center justify-center w-full flex-col",
            className
        )}>
            <FiInbox style={{ color: "#4c4c4c", fontSize: "5em" }} />
            <div className={"text-center"} style={{ color: "#4c4c4c", fontSize: "16px", fontWeight: "500" }}>{text}</div>
        </div>
    );
};

export default EmptyComponent;
