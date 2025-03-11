import './tank-change-event-view.scss'

import LargeIconEventView from "src/client/ui/events-hud/types/large-icon-event-view";
import React, { useEffect } from 'react';
import { useEvent } from '../events-hud';
import { EntityPrefab } from 'src/entity/entity-prefabs';

interface TankChangeEventViewProps {
    newTank: EntityPrefab
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

    const tankName = props.newTank.metadata.displayName

    return (
        <LargeIconEventView icon={
            <div className="tank-change-event-icon"/>
        }>
            <div className="tank-change-event-title">
                <span className="tank-type">{tankName}</span>
                &nbsp;
                будет выбран после респавна
            </div>
            <div className="tank-change-event-subtitle">
                Вы можете быстро взорвать свой танк, нажав <span className="key">R</span>. Мы всё возместим.
            </div>
        </LargeIconEventView>
    )
}

export default TankChangeEventView