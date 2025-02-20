import './pause-key-value-row.scss'

import React from 'react';


interface PauseKeyValueRowProps {
    small?: boolean;
    children: React.ReactNode;
    className?: string;
}

const PauseKeyValueRow: React.FC<PauseKeyValueRowProps> = ({ small, children, className }) => {
    return (
        <div className={['pause-key-value-row', small ? 'small' : '', className].join(' ')}>
            {children}
        </div>
    );
};

export default PauseKeyValueRow;