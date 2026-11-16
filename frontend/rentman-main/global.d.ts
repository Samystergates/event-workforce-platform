interface User {
    token: string;
    id: number
    email: string
    about: string
    depId: number
    active: boolean
    status: string | null
    address: string | null
    accessLevel: string | null
    availabilityStatus: string | null
    rating: number | null
    contact: string | null
    agreement: any
    vat: string | null
    first_name: string
    last_name: string | null
    business_registration: any
    discussed_rate: any
    profile_image: string | null
    contact_person: string | null
    phone_number: string | null
    phone_number_planning: string | null
    invoice_mail: string | null
    sector: string | null
    kilometer_rate: string | null
    availability_start_date: string | null
    availability_end_date: string | null
    availability_dates: string[] | null
    unavailability_dates: string[] | null,
    unknown_dates: string[] | null
    availability_options: 'WEEK'| 'MONTH' | 'YEAR' | null
    drivers_license: string | null
    date_of_birth: string | null
    skills: {id: number, skill_name: string}[]
}
