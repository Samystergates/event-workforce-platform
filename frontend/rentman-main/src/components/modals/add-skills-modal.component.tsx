import React, {useRef, useState} from 'react';
import CommonDialogComponent from "@/components/common/common-dialog.component";
import {useForm} from "react-hook-form";
import {FaMinus} from "react-icons/fa6";
import ControllerInputComponent from "@/components/forms/controller-input.component";
import {Button} from "@/components/ui/button";
import HStackComponent from "@/components/common/horizontal-stack.component";
import {DialogClose} from "@/components/ui/dialog";
import {isEmpty} from "lodash";
import {axios} from "@/lib/axiosInstance";
import useAuthRequest from "@/lib/useAuthRequest";
import {IconsComponent} from "@/components/common/icons.component";
import {useToast} from "@/components/ui/use-toast";

type componentPropType = {
    setSkillSet: React.Dispatch<React.SetStateAction<{ value: number, label: string }[]>>,
    otherSkill?: boolean
}

const AddSkillsModalComponent = ({setSkillSet, otherSkill}: componentPropType) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [skillInfo, setSkillInfo] = useState<number[]>([1]);
    const [loading, setLoading] = useState<boolean>(false);
    const {toast} = useToast()
    useAuthRequest()

    const {
        handleSubmit,
        control,
        setError,
        reset,
        formState: {errors},
    } = useForm<any>({
        defaultValues: {
            skill_name_1: '',
        },
    })

    const onSubmit = (data: any) => {
        setLoading(true)
        const errorHighLight: number[] = []
        skillInfo.map(skill => {
            if (isEmpty(data[`skill_name_${skill}`])) {
                setError(`skill_name_${skill}`, {
                    type: "manual",
                    message: "Dit veld is verplicht.",
                })
                errorHighLight.push(skill)
            }
        })

        if (buttonRef && isEmpty(errorHighLight)) {
            if (otherSkill) {
                skillInfo.map((skill) => {
                    setSkillSet(prevState => [...prevState, {
                        value: prevState.length + skill,
                        label: data[`skill_name_${skill}`]
                    }])
                })
                setLoading(false)
                reset()
                setSkillInfo([1])
                buttonRef.current?.click()
            } else {
                const promise: any[] = []
                skillInfo.map(skill => {
                    promise.push(axios.post('/user/createSkill', {"skill_name": data[`skill_name_${skill}`]}))
                })
                Promise.all(promise).then(promiseData => {
                    promiseData.forEach(response => {
                        if (response.data.error) {
                            errorHighLight.push(response.data.error)
                            toast({
                                variant: "destructive",
                                title: "Uh oh! Something went wrong.",
                                description: response.data.error,
                            })
                        }
                    })
                    if (isEmpty(errorHighLight)) {
                        promiseData.forEach(response => {
                            setSkillSet(prevState => [...prevState, {
                                value: response.data.id,
                                label: response.data.skill_name
                            }])
                        })
                        setLoading(false)
                        reset()
                        setSkillInfo([1])
                        buttonRef.current?.click()
                    } else {
                        setLoading(false)
                    }
                })
            }
        } else {
            setLoading(false)
        }
    }

    return (
        <CommonDialogComponent
            triggerLabel={'Add skill'}
            triggerVariant={'secondary'}
            triggerClassName={'w-full md:min-w-[7em]  md:w-fit'}
            dialogTitle={'Add Skills'}
            dialogBody={
                <form className={"flex flex-col gap-0"}>
                    {skillInfo.map(skill => (
                        <HStackComponent className={'!mt-3'} key={skill}>
                            <ControllerInputComponent placeholder='Enter your skill here...' notShowLabel
                                                      errors={errors}
                                                      control={control} inputName={`skill_name_${skill}`}
                                                      labelName={'Skills'}/>
                            {skillInfo.length > 1 && (
                                <Button
                                    onClick={() => setSkillInfo(prevState => prevState.filter(state => state !== skill))}
                                    variant={'outline'}
                                    type="button"
                                    className={'rounded-full w-[2em] h-[2em] mt-[0.55em] p-0'}
                                >
                                    <FaMinus className={'text-sm text-red-900'}/>
                                </Button>
                            )}
                        </HStackComponent>
                    ))}
                    <Button type="button" onClick={() => setSkillInfo([...skillInfo, skillInfo.length + 1])}
                            variant={'ghost'}
                            className="text-center text-sm text-muted-foreground my-4">
                        --- Add more ---
                    </Button>
                    <HStackComponent className={'w-full justify-end'}>
                        <DialogClose asChild>
                            <Button ref={buttonRef} type="button" variant="secondary">
                                Dichtbij
                            </Button>
                        </DialogClose>
                        <Button disabled={loading} type={'button'} className={'w-4/12'}
                                onClick={handleSubmit(onSubmit)}>
                            {loading && (
                                <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin"/>
                            )}
                            Redden
                        </Button>
                    </HStackComponent>
                </form>
            }
        />
    );
};

export default AddSkillsModalComponent;
