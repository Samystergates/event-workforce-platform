import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import Image from "next/image";
import VStackComponent from './vertical-stack.component';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoCameraOutline } from 'react-icons/io5';
import { FaUserAlt } from "react-icons/fa";

type componentPropType = {
    disabled?: boolean;
    onChangeHandler?: (e: ChangeEvent<HTMLInputElement>) => void
    image?: File | string;
    notLabelShow?: boolean
}

const ProfilePhotoComponent = ({ disabled, onChangeHandler, image, notLabelShow }: componentPropType) => {
    const inputElement = useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();

    useEffect(() => {
        if (!image) {
            setPreviewUrl(undefined);
            return;
        }

        if (image instanceof File) {
            const objectUrl = URL.createObjectURL(image);
            setPreviewUrl(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }

        setPreviewUrl(image);
    }, [image]);

    const handleSelectImage = () => {
        inputElement.current?.click();
    };

    return (
        <VStackComponent className={'w-fit items-center'}>
            {!notLabelShow && (
                <Label htmlFor={'profilePhoto'} className="text-left">
                    Profile Photo
                </Label>
            )}
            <Button
                type={'button'}
                onClick={handleSelectImage}
                variant={'ghost'}
                className={'bg-[#eeeeee9c] w-[12em] h-[12em] shadow-lg rounded-full relative overflow-hidden !p-0'}
            >
                {previewUrl ? (
                    <div className={'relative h-full w-full'}>
                        <Image
                            src={previewUrl}
                            alt={'profilePhoto'}
                            fill
                            className={'object-cover'}
                            sizes="192px"
                            unoptimized
                        />
                    </div>
                ) : (
                    <div className={'absolute h-full w-full hover:bg-[#eeeeee9c] items-center justify-center flex'}>
                        <FaUserAlt className={'w-1/2 h-1/2 text-gray-300'} />
                    </div>
                )}
                {previewUrl && (
                    <div className={'absolute h-full w-full hover:bg-[#eeeeee9c] text-transparent hover:text-gray-400 items-center justify-center hover:flex'}>
                        <IoCameraOutline className={'w-9 h-9'} />
                    </div>
                )}
            </Button>
            <div className={'hidden'}>
                <Input
                    ref={inputElement}
                    min={0}
                    disabled={disabled}
                    accept={"image/*"}
                    onChange={onChangeHandler}
                    type={'file'}
                    className="col-span-3"
                />
            </div>
        </VStackComponent>
    );
};

export default ProfilePhotoComponent;
