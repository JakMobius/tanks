
import React from "react";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import PauseSelectRow from "src/client/ui/overlay/pause-overlay/elements/pause-select-row";
import { PauseMenuView, PauseMenuButton } from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import ReactDOM from "react-dom/client";
import View from "src/client/ui/view";

interface GraphicsViewProps {
    
}

const GraphicsView: React.FC<GraphicsViewProps> = (props) => {
    return <PauseMenuView>
        <PauseSelectRow text="Качество рендера" value="x2"></PauseSelectRow>
        <PauseSelectRow text="Тени на танках" value="Вкл."></PauseSelectRow>
        <PauseSelectRow text="Закругление гусениц" value="Вкл."></PauseSelectRow>
        <PauseSelectRow text="Сглаживание" value="MSAA 4x"></PauseSelectRow>
        <PauseSelectRow text="Кадровый таймер" value="RAF"></PauseSelectRow>
        <PauseMenuButton>Взглянуть на мир</PauseMenuButton>
        <PauseMenuButton red>Запустить бенчмарк</PauseMenuButton>
        <div className="bottom-text">Нет, у тебя серьезно проблемы с производительностью в этой игре? Зачем может вообще потребоваться заходить сюда?</div>
    </PauseMenuView>
}

export default class GraphicsController extends PauseViewController {
    root: ReactDOM.Root
    
    constructor() {
        super();
        this.title = "Новая карта"
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0]);
        this.root.render(<GraphicsView/>)
    }
}