import React, {useState} from 'react';
import CommonSelectComponent from "@/components/common/common-select.component";

const AssignServiceProviderDropdown = ({selectedOption}: { selectedOption: { value: string | number, label: string }[] }) => {
    const [providerId, setProviderId] = useState<number>();

    return (
        <div className={'max-w-[25em] min-w-40 items-center w-full'}>
            <CommonSelectComponent
                placeholder={'View freelancer'}
                onChange={(e) => {
                    setProviderId(Number(e))
                }}
                selectedValue={providerId ? `${providerId}` : ''}
                selectOption={selectedOption}
            />
        </div>
    );
};

export default AssignServiceProviderDropdown;
