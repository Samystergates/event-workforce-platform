// @flow
import {boolean, mixed, object, string} from 'yup';
import {isEmpty} from "lodash";

export const EventFormSchema = () => {
    return object().shape({
        title: string().required('Dit veld is verplicht.'),
        destination: string().required('Dit veld is verplicht.'),
        role: string().required('Dit veld is verplicht.'),
        description: string().required('Dit veld is verplicht.'),
        project_lead_name: string().required('Dit veld is verplicht.'),
        project_lead_number: string().required('Dit veld is verplicht.'),
        start_time: string().required('Dit veld is verplicht.'),
        end_time: string().required('Dit veld is verplicht.'),
        number_of_people: string().required('Dit veld is verplicht.'),
        required_skills: mixed().test('isRequired', 'Dit veld mag niet leeg zijn.', (value, context) => {
            return !isEmpty(value);
        }),
        potential_service_providers: mixed().test('isRequired', 'Dit veld mag niet leeg zijn.', (value, context) => {
            return !isEmpty(value);
        }),
        project_id: mixed().nullable(),
        // .test('checkNoPerson', 'Het aantal mensen moet gelijk zijn aan het aantal geselecteerde freelancers.', (value, context) => {
        //     return (value as any)?.length === Number(context.parent.number_of_people)
        // }),
        start_date: mixed().required('Dit veld is verplicht.'),
        end_date: mixed().required('Dit veld is verplicht.')
    });
};
