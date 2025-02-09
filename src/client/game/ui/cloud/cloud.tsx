import "./cloud.scss"
import View from "src/client/ui/view";

import React from 'react';
import ReactDOM from 'react-dom/client';
import './cloud.scss';

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

export const CloudComponent = React.forwardRef<HTMLDivElement, CloudProps>(({
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

export default class Cloud extends View {
    props: CloudProps = {};
    root: ReactDOM.Root;

    constructor(text?: string) {
        super();
        this.root = ReactDOM.createRoot(this.element[0]);
        this.props.text = text
    }

    renderReactComponent() {
        this.root.render(<CloudComponent {...this.props} />);
    }

    // ...existing methods...
    
    button(enable: boolean = true) {
        this.props.button = enable;
        this.renderReactComponent();
        return this;
    }

    stretch(enable: boolean = true) {
        this.props.stretch = enable;
        this.renderReactComponent();
        return this;
    }

    red(enable: boolean = true) {
        this.props.red = enable;
        this.renderReactComponent();
        return this;
    }

    blue(enable: boolean = true) {
        this.props.blue = enable;
        this.renderReactComponent();
        return this;
    }

    round(enable: boolean = true) {
        this.props.round = enable;
        this.renderReactComponent();
        return this;
    }

    text(text: string) {
        this.props.text = text;
        this.renderReactComponent();
        return this;
    }

    customClass(clazz: string) {
        this.props.customClass = clazz;
        this.renderReactComponent();
        return this;
    }

    leftArrowed(enable: boolean = true) {
        this.props.leftArrowed = enable;
        this.renderReactComponent();
        return this;
    }
}