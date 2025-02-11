
import "./graphics-view.scss"

import React from "react";
import PauseSelectRow from "src/client/ui/overlay/pause-overlay/elements/pause-select-row";
import { PauseNavigationItem, PauseMenuButton } from "src/client/ui/overlay/pause-overlay/pause-menu-view";

const GraphicsView: React.FC = () => {
    return (
        <PauseNavigationItem title="Графика">
            <PauseSelectRow text="Качество рендера" value="x2"></PauseSelectRow>
            <PauseSelectRow text="Тени на танках" value="Вкл."></PauseSelectRow>
            <PauseSelectRow text="Закругление гусениц" value="Вкл."></PauseSelectRow>
            <PauseSelectRow text="Сглаживание" value="MSAA 4x"></PauseSelectRow>
            <PauseSelectRow text="Кадровый таймер" value="RAF"></PauseSelectRow>
            <PauseMenuButton>Взглянуть на мир</PauseMenuButton>
            <PauseMenuButton red>Запустить бенчмарк</PauseMenuButton>
            <div className="bottom-text-container">
                <div className="bottom-text">
                    Нет, у тебя серьезно проблемы с производительностью в этой игре? Зачем может вообще потребоваться заходить сюда?
                </div>
            </div>
        </PauseNavigationItem>
    )
}

export default GraphicsView;