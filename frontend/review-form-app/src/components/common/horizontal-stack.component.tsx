import React from 'react';

interface HStackComponentProps {
    children: React.ReactNode;
    className?: string;
}

const HStackComponent: React.FC<HStackComponentProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex flex-row gap-4 ${className}`}>
            {children}
        </div>
    );
};

export default HStackComponent;