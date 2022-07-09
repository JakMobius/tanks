import Progress from './progress';

// TODO: copy-paste

export default class Downloader {

    static getXHR(dataType: XMLHttpRequestResponseType, progress: Progress) {
        let xhr = new XMLHttpRequest();
        if(dataType)
            xhr.responseType = dataType;
        if(progress) {
            xhr.addEventListener("progress", (evt) => {
                if (evt.lengthComputable) {
                    // Avoid triggering completion event
                    if(evt.loaded >= evt.total) return;
                    progress.setTarget(evt.total)
                    progress.setCompleted(evt.loaded)
                }
            }, false);
        }
        return () => xhr
    }

    static downloadBinary(url: string, handler: (response: ArrayBuffer) => void | Promise<void>): Progress {
        let progress = new Progress()

        let request = $.ajax({
            url: url,
            xhr: this.getXHR("arraybuffer", progress),
        }).done((msg) => {
            Promise.resolve(handler(msg)).then(() => progress.complete())
        }).fail((response, _status, error) => {
            progress.fail(error)
        })

        progress.on("abort", () => request.abort())

        return progress
    }

    static download(url: string, handler: (response: any) => void | Promise<void>, contentType: string): Progress {

        let progress = new Progress()

        let request = $.ajax({
            url: url,
            xhr: this.getXHR(null, progress),
            contentType: contentType,
        }).done((msg) => {
            Promise.resolve(handler(msg)).then(() => progress.complete())
        }).fail((response, _status, error) => {
            progress.fail(error)
        })

        progress.on("abort", () => request.abort())

        return progress
    }

    static downloadImage(url: string, handler: (image: HTMLImageElement) => void | Promise<void>) {

        let progress = new Progress()

        let image = new Image()

        $(image).attr({
            src: url
        }).on("load", () => {
            if (image.complete) {
                Promise.resolve(handler(image)).then(() => progress.complete())
            } else {
                progress.fail("Failed to download image")
            }
        }).on("error", () => {
            progress.fail("Failed to download image")
        })

        progress.on("abort", () => image.src = "")

        return progress
    }
}