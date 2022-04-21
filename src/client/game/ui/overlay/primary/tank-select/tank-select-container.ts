/* @load-resource: './tank-select.scss' */

import Menu from 'src/client/ui/menu/menu';

export default class TankSelectContainer extends Menu {
	public shadowLeft: JQuery;
	public shadowRight: JQuery;
	public container: JQuery;
	public leftShadowHidden: boolean;
	public rightShadowHidden: boolean;

    constructor() {
        super();

        this.element.addClass("tankselect")

        this.shadowLeft = $("<div>").addClass("shadow left");
        this.shadowRight = $("<div>").addClass("shadow right");

        this.container = $("<div>").addClass("tank-select-container")
        this.element.append(this.container, this.shadowLeft, this.shadowRight)

        this.leftShadowHidden = false
        this.rightShadowHidden = false

        this.setupList()
    }

    setupList() {

        // Использую forEach здесь, чтобы создать область видимости.
        // В for-in нельзя было бы юзать Tank в асинхронном коде.
        // Пишу это, чтобы будущий я не злился на меня из прошлого,
        // читая этот код. Знай, что переписать танчики стоило
        // примерно месяц времени, там есть на что злиться. Можешь
        // перечитать то что там понаписано, это звездец.
        // Хотя с другой стороны, человек набирает опыт, и, возможно,
        // в будущем я смогу применить более интересные практики для
        // улучшения архитектуры и упрощения кода. Так что если ты
        // взялся переписывать танчики снова, то флаг тебе в руки. Мне
        // очень интересно что ты придумаешь через год-два. Мда. Из
        // обычной пометки этот комментарий превратился в письмо в
        // будущее. Классика.

        // UPD: Два года прошло. Танчики переписываются на ECS. Жаль,
        // что нельзя написать письмо в прошлое и удивить меня 11-классника.
        // А еще этот самый forEach мне пришлось удалить, поскольку
        // в новой архитектуре игры он не работал бы.

        // ClientTank.Tanks.forEach((Tank) => {
        //
        // })
    }
}