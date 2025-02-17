import './tank-change-event-view.scss'

import LargeIconEventView from "src/client/ui/overlay/events-overlay/types/large-icon-event-view";
import {getTankDescription} from "src/client/ui/overlay/tank-select-overlay/tank-descriptions";
import React, { useEffect } from 'react';
import { useEvent } from '../event-overlay';

interface TankChangeEventViewProps {
    newTank: number
}

const TankChangeEventView: React.FC<TankChangeEventViewProps> = (props) => {

    const event = useEvent()

    useEffect(() => {
        let timeout = setTimeout(() => {
            event.remove()
        }, 30000)

        return () => {
            clearTimeout(timeout)
        }
    }, [])

    return (
        <LargeIconEventView icon={
            <div className="tank-change-event-icon"/>
        }>
            <div className="tank-change-event-title">
                <span className="tank-type">{getTankDescription(props.newTank).name}</span>
                будет выбран после респавна
            </div>
            <div className="tank-change-event-subtitle">
                Вы можете быстро взорвать свой танк, нажав <span className="key">R</span>. Мы всё возместим.
            </div>
        </LargeIconEventView>
    )
}

export default TankChangeEventView