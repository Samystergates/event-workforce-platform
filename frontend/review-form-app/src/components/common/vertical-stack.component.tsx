import React from 'react';

interface VStackComponentProps {
    children: React.ReactNode;
    className?: string;
}

const VStackComponent: React.FC<VStackComponentProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex flex-col gap-2 w-full ${className}`}>
            {children}
        </div>
    );
};

export default VStackComponent;