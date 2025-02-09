import "./cloud.scss"
import React from 'react';

export interface CloudProps {
    text?: string;
    button?: boolean;
    stretch?: boolean;
    red?: boolean;
    blue?: boolean;
    round?: boolean;
    customClass?: string;
    leftArrowed?: boolean;
    children?: React.ReactNode;
}

const Cloud = React.forwardRef<HTMLDivElement, CloudProps>(({
    text,
    button,
    stretch,
    red,
    blue,
    round,
    customClass,
    leftArrowed,
    children
}, ref) => {
    const classNames = ['cloud'];
    if (button) classNames.push('button');
    if (stretch) classNames.push('stretch');
    if (red) classNames.push('red');
    if (blue) classNames.push('blue');
    if (round) classNames.push('round');
    if (leftArrowed) classNames.push('left-arrowed');
    if (customClass) classNames.push(customClass);

    return (
        <div className={classNames.join(' ')} role={button ? 'button' : undefined} ref={ref}>
            {children ?? text}
        </div>
    );
});

export default Cloud;