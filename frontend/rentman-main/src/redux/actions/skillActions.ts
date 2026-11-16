import store from "@/redux/store";
import React from "react";
import {axios} from "@/lib/axiosInstance";
import {isUndefined} from "lodash";
import {saveOtherEventSkill, saveSkill} from "@/redux/reducers/skillReducers";

const {dispatch} = store

export const getAllSkills = async (setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
                                   setSkillSet?: React.Dispatch<React.SetStateAction<{ value: number, label: string }[]>>,
                                   setOtherSkills?: React.Dispatch<React.SetStateAction<{ value: number, label: string }[]>>
) => {
    setIsLoading(true)
    const skillsData = await axios.get('/user/getAllSkills')
    if (isUndefined(skillsData?.data?.error)) {
        const sortableData = [...skillsData.data];
        const sortedData = sortableData.sort((a: { id: number, name: string }, b: { id: number, name: string }) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        })
        setSkillSet && setSkillSet(sortedData.map((value: { id: number, name: string }) => ({
            value: value.id,
            label: value.name
        })))
        setOtherSkills && setOtherSkills(sortedData.map((value: { id: number, name: string }) => ({
            value: value.id,
            label: value.name
        })))
        dispatch(saveSkill(sortedData))
        dispatch(saveOtherEventSkill(sortedData))
        setIsLoading(false)
    } else {
        setIsLoading(false)
    }
}
