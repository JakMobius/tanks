import './pause-key-value-row.scss'

import React from 'react';


interface PauseKeyValueRowProps {
    small?: boolean;
    children: React.ReactNode;
    customClass?: string;
}

const PauseKeyValueRow: React.FC<PauseKeyValueRowProps> = ({ small, children, customClass }) => {
    return (
        <div className={['pause-key-value-row', small ? 'small' : '', customClass].join(' ')}>
            {children}
        </div>
    );
};

export default PauseKeyValueRow;