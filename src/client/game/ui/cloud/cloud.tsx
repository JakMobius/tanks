import "./cloud.scss"
import React from 'react';

export interface CloudProps {
    button?: boolean;
    stretch?: boolean;
    red?: boolean;
    blue?: boolean;
    round?: boolean;
    customClass?: string;
    leftArrowed?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
}

const Cloud: React.FC<CloudProps> = (({
    button,
    stretch,
    red,
    blue,
    round,
    customClass,
    leftArrowed,
    children,
    onClick
}) => {
    const classNames = ['cloud'];
    if (button) classNames.push('button');
    if (stretch) classNames.push('stretch');
    if (red) classNames.push('red');
    if (blue) classNames.push('blue');
    if (round) classNames.push('round');
    if (leftArrowed) classNames.push('left-arrowed');
    if (customClass) classNames.push(customClass);

    return (
        <div onClick={onClick} className={classNames.join(' ')} role={button ? 'button' : undefined}>
            {children}
        </div>
    );
});

export default Cloud;