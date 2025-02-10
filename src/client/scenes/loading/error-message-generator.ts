import {chooseRandom} from "src/utils/utils";

export type ErrorMessageVariant = {
    header?: string,
    description: string,
    retryText?: string
    goBackText?: string
}

export type ErrorMessageTemplates = { [key: string]: (string[] | (() => string) | undefined) }

const nonsenseErrorHeaders = [
    "Ой", "Упс", "Ай", "Бабах", "Бум", "Бдыщь", "Скидыщь", "Бадабум", "Пуф", "Блин", "Ох", "Ёпрст", "Опс", "Опа"
]

export function getNonsenseErrorHeader() {
    return chooseRandom(nonsenseErrorHeaders) + chooseRandom(["!", "..."])
}

export default class ErrorMessageGenerator {

    constructor(variants: ErrorMessageVariant[], templates: ErrorMessageTemplates = {}) {
        this.variants = variants
        this.templates = templates
    }

    templates: ErrorMessageTemplates
    variants: ErrorMessageVariant[]

    replaceTemplates(string: string | undefined): string | undefined {
        if (string === undefined) {
            return undefined
        }

        let templates = this.templates

        const regex = /{[^{}]+}/g;
        return string.replace(regex, (match) => {
            const template = match.slice(1, -1);

            if (Object.prototype.hasOwnProperty.call(templates, template)) {
                let templateValue = templates[template]
                if(typeof templateValue === "function") {
                    return templateValue()
                } else {
                    return chooseRandom(templateValue)
                }
            }

            return match
        });
    }

    generateVariant(): ErrorMessageVariant {
        let variant = chooseRandom(this.variants)

        variant.header = variant.header ? this.replaceTemplates(variant.header) : getNonsenseErrorHeader()
        variant.description = this.replaceTemplates(variant.description)
        variant.retryText = this.replaceTemplates(variant.retryText)
        variant.goBackText = this.replaceTemplates(variant.goBackText)

        return variant
    }
}

export const internetErrorMessageGenerator = new ErrorMessageGenerator([
    {
        description: "У нас тут не получилось скачать кое-что. Проверь, что с твоим интернетом всё в порядке.",
        retryText: "Проверил, {try-again}"
    }, {
        description: "Твой интернет сегодня капризничает. Пойди, поговори с ним, что ли...",
        retryText: "Я поговорил с ним, {try-again}"
    }, {
        description: "Интернет-эльфы устали крутить сетевые педали, и теперь мы не можем загрузить игру.",
        retryText: "Я дал им еды, {try-again}"
    }, {
        description: "Кажется, файлы игры потерялись в лабиринтах интернета.",
        retryText: "Сейчас я их найду"
    }, {
        description: "По-моему, в твой роутер попал снаряд от бигбоя, и теперь ничего не загружается.",
        retryText: "Купил новый роутер, {try-again}"
    }, {
        description: "{simple-problem}. Проверь, может Мерзила сжёг маршрутизатор?",
        retryText: "Я всё потушил, {try-again}"
    }, {
        description: "{simple-problem}. Проверь, не упал ли твой роутер в бассейн.",
        retryText: "Я его просушил, {try-again}"
    }, {
        description: "{simple-problem}. А ты точно оплатил интернет?",
        retryText: "Точно, точно, {try-again}"
    }, {
        description: "{simple-problem}. А ты сегодня приносил жертву богам интернета?",
        retryText: "Я принёс им денег, {try-again}"
    }, {
        description: "{simple-problem}. Проверь, не решил ли твой кот поиграть с проводами?",
        retryText: "Я запер его в туалете, {try-again}"
    }
], {
    "try-again": [
        "давай еще раз",
        "попробуй еще раз",
        "попробуй заново"
    ],
    "simple-problem": [
        "С твоим интернетом беда",
        "Не удалось загрузить данные",
        "Что-то не загрузилось",
        "У нас тут не получилось скачать кое-что",
        "У нас не получилось загрузить игру"
    ]
})

export const unknownErrorMessageGenerator = new ErrorMessageGenerator([
    {
        description: "У нас тут всё взорвалось. Кто-то положил боеприпасы для танков прямо в программный код игры."
    }, {
        description: "Ты слышал грохот? Это игра упала с велосипеда. Теперь будет ходить на костылях. Но мы её вылечим."
    }, {
        description: "Это катастрофа. Один из наших танкистов должен был нажать на 'Включить', а нажал на 'Взорвать'. Но мы уже всё чиним."
    }, {
        description: "Ошибка STOP 0x000000A. Кажется, пора переустанавливать Windows."
    }, {
        description: "Квантовая запутанность привела к неведомой ошибке в нашем коде."
    }, {
        description: "{its-broken}. Кто-то забыл пропылесосить код игры, и пыль забила все щели."
    }, {
        description: "{its-broken}. Кажется, кто-то попытался научить игру готовить борщ, и она перепутала морковь с картошкой."
    }, {
        description: "{its-broken}. Бродячий кот погрыз биты с байтами в нашем коде. Теперь это кото-код."
    }, {
        description: "{its-broken}. Позвони на горячую линию. Ой, у нас же нет горячей линии. Ну, попробуй перезагрузить..."
    }, {
        description: "{its-broken}. Виновата лунная фаза, она сегодня не благоприятна для танков."
    }, {
        description: "Ошибка поиска {complex-start}-{complex-end} в блоке {block-index}. Шутка. Мы без понятия, что сломалось."
    }, {
        description: "Ошибка в работе {complex-adjective}{complex-start}-{complex-end}. А может быть и нет. Мы пока не знаем."
    }
], {
    "complex-adjective": [
        "квантовой ",
        "многомерной ",
        "параллельной ",
        "виртуальной ",
        "полиномиальной ",
        "полигональной ",
        "сверхпроводящей ",
        ""
    ],
    "complex-start": [
        "альфа",
        "бета",
        "гамма",
        "дельта",
        "эпсилон",
    ],
    "complex-end": [
        "кластеризации",
        "сигнатуры",
        "константы",
        "переменной",
        "функции",
        "модульной зависимости"
    ],
    "block-index": () => {
        return "0x" + Math.floor(Math.random() * 0xFFFFFFFF).toString(16)
    },
    "its-broken": [
        "Всё сломалось.",
        "Игра сломалась.",
        "Всё взорвалось.",
        "Катастрофа.",
        "Произошла ошибка."
    ]
})

export const serverErrorMessageGenerator = new ErrorMessageGenerator([
    {
        description: "Что-то не получилось. Сервер, похоже, прилёг отдохнуть.",
        retryText: "Может, его разбудили? {try-again}"
    }, {
        description: "Из-за твоего запроса целый дата-центр сейчас горит синим пламенем.",
        retryText: "Может, его уже потушили? {try-again}"
    }, {
        description: "Сервер сейчас занят борьбой с киберзубрами. {try-later}.",
        retryText: "Может, он уже победил? {try-again}"
    }, {
        description: "Сервер ушел в отпуск без предупреждения.",
        retryText: "Может, он уже вернулся? {try-again}"
    }, {
        description: "Сервер сейчас занят переговорами с инопланетянами. {try-later}.",
        retryText: "Может, он уже договорился? {try-again}"
    }, {
        description: "Сервер сейчас занят устранением последствий нападения пиратов. {try-later}.",
        retryText: "Может, он уже отбил атаку? {try-again}"
    }, {
        description: "Сервер сейчас занят борьбой с гигантским роботом. {try-later}.",
        retryText: "Может, он уже победил его? {try-again}"
    }, {
        description: "Сервер сейчас занят написанием своей автобиографии. {try-later}.",
        retryText: "Может, он уже закончил ее? {try-again}"
    }, {
        description: "Сервер сейчас занят поиском смысла жизни. {try-later}.",
        retryText: "Может, он уже нашел его? {try-again}"
    }, {
        description: "Сервер сейчас занят подготовкой к концу света. {try-later}.",
        retryText: "Может, он уже отменил конец света? {try-again}"
    }
], {
    "try-later": [
        "Подожди немного",
        "Попробуй позже"
    ],
    "try-again": [
        "давай еще раз",
        "попробуй еще раз",
        "попробуй заново"
    ]
})

export const noSuchRoomErrorMessageGenerator = new ErrorMessageGenerator([
    {
        description: "Кажется, ты потерялся в лабиринте интернета и оказался в несуществующей игровой комнате.",
        retryText: "{default-action}"
    }, {
        description: "Эта игровая комната была поглощена черной дырой. Лучше не рискуй и найди другую комнату.",
        retryText: "{default-action}"
    }, {
        description: "Не могу найти эту игровую комнату. А ты точно правильно ввел ссылку?",
        retryText: "{default-action}"
    }, {
        description: "Ой, кажется, здесь ничего нет. Эта игровая комната была удалена или никогда не существовала.",
        retryText: "{default-action}"
    }
], {
    "default-action": [
        "Может, она всё-таки есть?",
        "Я тебе не верю, попробуй еще раз",
        "Давай попробуем еще раз"
    ]
});

export const missingRoomNameErrorMessageGenerator = new ErrorMessageGenerator([
    {
        description: "Кажется, ты забыл указать название игровой комнаты. Проверь еще разок.",
    }, {
        description: "Не могу найти название игровой комнаты в этой ссылке. Ты точно все правильно ввел?",
    }, {
        description: "Ой, кажется, здесь нет названия игровой комнаты. Попробуй ввести правильную ссылку.",
    }, {
        description: "Эта ссылка выглядит неполной. Убедись, что ты правильно ввел название игровой комнаты.",
    }
], {});