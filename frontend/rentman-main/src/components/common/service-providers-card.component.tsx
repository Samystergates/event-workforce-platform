import React from 'react';
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import ServiceProviderProfileViewModal
    from "@/app/(protected)/dashboard/components/service-provider-profile-view.modal";
import ProfilePhotoComponent from "@/components/common/profile-photo.component";
import {Rating} from "react-simple-star-rating";
import {FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp} from "react-icons/fa";

type componentPropType = {
    item: {
        id: number;
        name: string;
        email: string;
        about: string;
        street: string;
        zip: string;
        city: string;
        contact: string;
        age: number;
        profile_image?: string;
        rating?: number
    }
    rating?: boolean
    onRatingClick?: ({rating, serviceProviderId}: {rating: number, serviceProviderId: number}) => void
    ratingUserInfo?: {rating: number, serviceProviderId: number}[]
}

const ServiceProviderCard = ({item, rating, onRatingClick, ratingUserInfo}: componentPropType) => {
    return (
        <div className={'border p-2 rounded flex-col flex gap-2 w-[15em] h-[initial]'}>
            <div className={'h-full mb-2'}>
                <div className={'flex items-center justify-center'}>
                    <ProfilePhotoComponent notLabelShow disabled image={item.profile_image}/>
                </div>
                <div className={'font-bold flex'}>Name: <p
                    className={'font-light ml-1 break-words w-fit md:w-[10em]'}>{item.name}</p></div>
                <div className={'font-bold w-full flex-1'}>
                    <p className={"w-fit break-all"}>Email:</p><p className={'font-light w-fit break-words break-all'}>{item.email}</p>
                </div>
                <div className={'flex gap-1 font-bold w-full items-center'}>
                    <p className={"mt-1"}>Ratings:</p><Rating SVGstyle={{display: 'inline'}} size={20} readonly onClick={() => {
                }} initialValue={(Number(item?.rating) * 10) / 2}/>
                </div>
            </div>
            {(!rating && !onRatingClick && !ratingUserInfo) ? <ServiceProviderProfileViewModal userId={`${item.id}`} userName={item.name}/> : (
                <div className={'flex gap-2 justify-end'}>
                    {ratingUserInfo?.find(value => value.serviceProviderId === item.id)?.rating === 0
                        ? (<Button variant={'outline'} size={"icon"} onClick={() => onRatingClick && onRatingClick({rating: 0, serviceProviderId: item.id})}>
                            <FaThumbsDown className={"h-4 w-4 text-gray-500"}/>
                        </Button>)
                        : (
                            <Button variant={'outline'} size={"icon"} onClick={() => onRatingClick && onRatingClick({rating: 0, serviceProviderId: item.id})}>
                                <FaRegThumbsDown className={"h-4 w-4"}/>
                            </Button>
                        )}
                    {ratingUserInfo?.find(value => value.serviceProviderId === item.id)?.rating === 1
                        ? (<Button variant={'outline'} size={"icon"} onClick={() => onRatingClick && onRatingClick({rating: 1, serviceProviderId: item.id})}><FaThumbsUp className={"h-4 w-4 text-blue-500"}/></Button>)
                        : (<Button variant={'outline'} size={"icon"} onClick={() => onRatingClick && onRatingClick({rating: 1, serviceProviderId: item.id})}><FaRegThumbsUp className={"h-4 w-4"}/></Button>)}
                </div>
            )}
        </div>
    );
};

export default ServiceProviderCard;
