import {ProgressLeaf} from './progress';
import DOMEventHandlerSet from "src/utils/dom-event-handler-set";

// TODO: copy-paste

export default class Downloader {

    static getXHR(dataType: XMLHttpRequestResponseType, progress: ProgressLeaf) {
        let xhr = new XMLHttpRequest();
        if(dataType)
            xhr.responseType = dataType;
        if(progress) {
            xhr.addEventListener("progress", (evt) => {
                if (evt.lengthComputable) {
                    // Avoid triggering completion event
                    if(evt.loaded >= evt.total) return;
                    progress.setFraction2(evt.total, evt.loaded)
                }
            }, false);
        }
        return () => xhr
    }

    static downloadBinary(url: string, handler: (response: ArrayBuffer) => void | Promise<void>) {
        let progress = new ProgressLeaf()

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

    static download(url: string, handler: (response: any) => void | Promise<void>, contentType: string) {

        let progress = new ProgressLeaf()

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

        let progress = new ProgressLeaf()
        let image = new Image()

        // DOMEventHandlerSet is used here to remove event handlers
        // from image once load is finished. Since image is a long-living
        // entity, it's better to remove as many references from it as possible
        // to prevent memory leaks.

        let eventSet = new DOMEventHandlerSet()
        eventSet.setTarget(image)
        eventSet.on("load", () => {
            eventSet.setTarget(null)
            if (image.complete) {
                Promise.resolve(handler(image)).then(() => progress.complete())
            } else {
                progress.fail("Failed to download image")
            }
        })
        eventSet.on("error", () => {
            eventSet.setTarget(null)
            progress.fail("Failed to download image")
        })

        image.setAttribute("src", url)

        progress.on("abort", () => image.src = "")

        return progress
    }
}