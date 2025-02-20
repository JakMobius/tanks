
import "./graphics-view.scss"

import React from "react";
import PauseKeySelectRow from "src/client/ui/pause-overlay/elements/pause-select-row";
import { PauseNavigationItem, PauseMenuButton } from "src/client/ui/pause-overlay/pause-menu-view";

const GraphicsView: React.FC = () => {
    return (
        <PauseNavigationItem title="Графика">
            <PauseKeySelectRow blue title="Качество рендера" options={[
                { name: "x1", data: "1" },
                { name: "x2", data: "2" },
                { name: "x3", data: "3" },
            ]} defaultValue="2"/>
            <PauseKeySelectRow blue title="Тени на танках" options={[
                { name: "Вкл.", data: "1" },
                { name: "Выкл.", data: "0" },
            ]} defaultValue="1"/>
            <PauseKeySelectRow blue title="Закругление гусениц" options={[
                { name: "Вкл.", data: "1" },
                { name: "Выкл.", data: "0" },
            ]} defaultValue="1"/>  
            <PauseKeySelectRow blue title="Сглаживание" options={[
                { name: "Нет", data: "none" },
                { name: "MSAA 2x", data: "msaa2" },
                { name: "MSAA 4x", data: "msaa4" },
            ]} defaultValue="msaa4"/>
            <PauseKeySelectRow blue title="Кадровый таймер" options={[
                { name: "RAF", data: "raf" },
                { name: "setTimeout", data: "setTimeout" },
            ]} defaultValue="raf"/>
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