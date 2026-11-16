import React from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BsCalendar4Event, BsFillPersonFill } from "react-icons/bs";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { BiBook } from "react-icons/bi";
import { FiUserPlus, FiUser, FiFolder } from "react-icons/fi"
import { PiUserListBold } from "react-icons/pi";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { MdOutlineAccessTime } from "react-icons/md";

export const sliderMenu = [
    {
        route: '/dashboard',
        icon: () => <AiOutlineHome className="h-5 w-5" />,
        name: 'Dashboard'
    },
    {
        route: '/job-requests',
        icon: () => <BsCalendar4Event className="h-4 w-4" />,
        name: 'Events'
    },
    {
        route: '/profile',
        icon: () => <FiUser className="h-5 w-5" />,
        name: 'My Profile'
    },
]

export const clientMenu = [
    {
        route: '/dashboard',
        icon: () => <AiOutlineHome className="h-5 w-5" />,
        name: 'Dashboard'
    },
    {
        route: '/assign-job',
        icon: () => <BsCalendar4Event className="h-4 w-4" />,
        name: 'Events'
    },
]

export const moderatorMenu = [
    {
        route: '/dashboard',
        icon: () => <AiOutlineHome className="h-5 w-5" />,
        name: 'Dashboard'
    },
    {
        route: '/all-jobs',
        icon: () => <BsCalendar4Event className="h-4 w-4" />,
        name: 'Events'
    },
    {
        route: '/invoices',
        icon: () => <LiaFileInvoiceSolid className="h-5 w-5" />,
        name: 'Invoices'
    },
    {
        route: '/payslips',
        icon: () => <IoDocumentAttachOutline className="h-5 w-5" />,
        name: 'Payslips'
    },
    {
        route: '/timesheets',
        icon: () => <MdOutlineAccessTime className="h-5 w-5" />,
        name: 'Timesheets'
    },
    {
        route: '/dashboard/projects',
        icon: () => <FiFolder className="h-5 w-5" />,
        name: 'Projects'
    },
    {
        route: '/accounts',
        icon: () => <BiBook className="h-5 w-5" />,
        name: 'Accounts'
    },
    // {
    //     route: '/accounts',
    //     icon: () => <PiUserListBold className="h-5 w-5"/>,
    //     name: 'All Freelancers'
    // },
    {
        route: '/create-user',
        icon: () => <FiUserPlus className="h-5 w-5" />,
        name: 'Create User'
    }
]
