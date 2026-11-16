import { IUserProfile } from "@/interfaces/user.interfaces";
import { IProject } from "@/interfaces/project.interfaces";

export interface IInvoices {
    id: number
    serviceProvider: any
    hoursWorked: number
    spRate: any
    jobDate: any
    kilometer: any
    extraCost: number
    startTime: string
    endTime: string
    breakMinutes: string
    // overtime: number
    // travelTime: number
    status: string
    extraCostDescription: any
    invoiceType: string
    dayOrHour: any
    invoiceNumber: any
    mergedInvoices: MergedInvoice[]
    invoiceDate: number[]
    files: any
    filePath: any[]
    invoiceDescription: any
    invoiceLines: any[]
    reviewedBySP: any
    reviewedByClient: any
}

export interface MergedInvoice {
    id: number
    serviceProvider: any
    job: IEvent
    hoursWorked: number
    spRate: any
    jobDate: any
    kilometer: any
    extraCost: any
    startTime: string
    endTime: string
    breakMinutes: string
    // overtime: number
    // travelTime: number
    status: string
    extraCostDescription: any
    invoiceType: string
    dayOrHour: string
    invoiceNumber: number
    mergedInvoices: any[]
    invoiceDate: number[]
    files: any
    filePath: any[]
    invoiceDescription: any
    invoiceLines: any[]
    reviewedBySP: any
    reviewedByClient: any
}

export interface Invoice {
    id: number
    serviceProvider: IUserProfile
    kilometer: number
    extraCost: number
    extraCostDescription: string
    startTime: string
    endTime: string
    // overtime: number
    // travelTime: number
    breakMinutes: string
}
export interface IEvent {
    id: number
    active: boolean
    title: string
    destination: string
    role: string
    description: string
    status: string
    client?: Client
    moderator?: Moderator
    service_providers_list: ServiceProvidersList[]
    created_by?: CreatedBy
    required_skills: RequiredSkill[]
    potential_service_providers: PotentialServiceProvider[]
    creation_date: number[]
    start_date: number[]
    end_date: number[]
    moderator_approval: number
    start_time: number[]
    end_time: number[]
    reviewed_by_client: boolean | null
    reviewed_by_service_provider: any
    number_of_people: number
    project_lead_name: string
    project_lead_number: string
    project?: IProject | null
    job_other_skills: string[]
}

export interface IPunchDetail {
  id: number;
  projectId: number;
  spId: number;
  action: string;
  timestamp: string | number;
}

export type PunchMatchStatus = 'match' | 'mismatch' | 'missing';

export interface ITimesheetPunchMatch {
  start: {
    status: PunchMatchStatus;
    punchTime?: string | null;
  };
  end: {
    status: PunchMatchStatus;
    punchTime?: string | null;
  };
}

export interface Client {
    id: number
    first_name: string
    last_name: string | null
    email: string
    about: string
    depId: number
    active: boolean
    status: boolean
    city: string
    billingInfo: string
    preferences: string
    occupation: string
    accessLevel: any
    availabilityStatus: any
    rating: any
    description: any
    age: any
    contact: any
    skills: any[]
}

export interface Moderator {
    id: number
    name: string
    email: string
    about: string
    depId: number
    active: boolean
    status: boolean
    city: string
    billingInfo: any
    preferences: any
    occupation: any
    accessLevel: string
    availabilityStatus: any
    rating: any
    description: any
    age: any
    contact: any
    skills: any[]
}

export interface ServiceProvidersList {
    id: number
    first_name: string
    last_name: string
    email: string
    about: string
    depId: number
    active: boolean
    status: boolean
    city: string
    billingInfo: any
    preferences: any
    occupation: any
    accessLevel: any
    availabilityStatus: boolean
    profile_image: string | null
    rating: number
    description: string
    age: number
    contact: string
    street?: string | null
    zip?: string | null
    date_of_birth?: string | null
    skills: Skill[]
}

export interface Skill {
    id: number
    skill_name: string
}

export interface CreatedBy {
    id: number
    name: string
    email: string
    about: string
    depId: number
    active: boolean
    status: boolean
    city: string
    billingInfo: any
    preferences: any
    occupation: any
    accessLevel: any
    availabilityStatus: any
    rating: any
    description: any
    age: any
    contact: any
    skills: any[]
}

export interface RequiredSkill {
    id: number
    skill_name: string
}

export interface PotentialServiceProvider {
    accepted: number
    job_id: number
    service_provider_id: number
}

export interface IPotentialJobs {
    "accepted": number,
    "job_id": number,
    "service_provider_id": number
}

export interface IPurchaseOrder {
    id: number
    serviceProvider: ServiceProvider
    hoursWorked: number
    spRate: number
    jobDate: number[]
    job: IEvent
    kilometer: any
    extraCost: any
    // startTime: string
    startTime: string | number[];
    endTime: string | number[];
    breakMinutes: string | number[];
    // traveltime: number
    // overtime: number
    workedtime: number
    status: string
    attention: boolean
    extraCostDescription: any
    invoiceType: string
    dayOrHour: string
    invoiceNumber: any
    mergedInvoices: any[]
    invoiceDate: number[]
    files: any
    filePath: any[]
    invoiceDescription: any
    invoiceLines: any[]
    reviewedBySP: any
    reviewedByClient: any
}

export interface ServiceProvider {
    id: number
    firstName: string
    lastName: string
    businessRegistration: string
    rateType: string
    timeBasedRate: boolean
    email: string
    discussedRate: number
    discussedRateRW: any
    hourRate: any
    hourRateRW: any
    nightRate: any
    nightRateRW: any
    weekendRate: any
    weekendRateRW: any
    password: string
    depId: number
    active: boolean
    status: any
    agreement: any
    about: string
    roles: any[]
    profileImage: any
    availabilityStatus: boolean
    rating: number
    kilometerRate: any
    contact: string
    availabilityStartDate: number[]
    availabilityEndDate: number[]
    unavailableStartDate: any
    unavailableEndDate: any
    unknownStartDate: any
    unknownEndDate: any
    availabilityOptions: string
    driversLicense: string
    dateOfBirth: number[]
    skills: any[]
    availabilityDates: any[]
    unavailabilityDates: any[]
    unknownDates: any[]
    age: number
    enabled: boolean
    username: string
    authorities: any[]
    vat: any
    credentialsNonExpired: boolean
    accountNonExpired: boolean
    accountNonLocked: boolean
}
