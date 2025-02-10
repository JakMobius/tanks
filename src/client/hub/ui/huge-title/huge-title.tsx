import './huge-title.scss'

import React from 'react';

const HugeTitle: React.FC<{children?: React.ReactNode}> = (props) => {
    return (
        <div className="huge-title">{props.children}</div>
    );
}

export default HugeTitle