import {IoPhonePortraitOutline} from "react-icons/io5";
import {CiLocationOn} from "react-icons/ci";
import {
    Client,
    CreatedBy,
    IEvent,
    Moderator,
    PotentialServiceProvider,
    RequiredSkill, ServiceProvidersList
} from "@/interfaces/event.interfaces";

export const concertDetails: {icon?: Function, detailType: string, details: string}[] = [
    {
        detailType: "Contact person",
        details: "Demo Contact"
    },
    {
        icon: () => <div className={'bg-[#eee] rounded-full flex items-center justify-center w-10 h-10'}><IoPhonePortraitOutline /></div>,
        detailType: "Contact details",
        details: "+1 555 0100 · contact@example.test"
    }
]

export const defaultEventData: IEvent = {
    id: 0,
    active: false,
    title: '',
    reviewed_by_client: null,
    reviewed_by_service_provider: null,
    destination: '',
    role: '',
    description: '',
    status: '',
    service_providers_list: [],
    required_skills: [],
    potential_service_providers: [],
    job_other_skills: [],
    creation_date: [],
    start_date: [],
    end_date: [],
    moderator_approval: 0,
    start_time: [],
    end_time: [],
    number_of_people: 0,
    project_lead_name: '',
    project_lead_number: '',
}
