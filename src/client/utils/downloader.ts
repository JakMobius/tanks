import Progress from './progress';

export default class Downloader {

    static getXHR(dataType: XMLHttpRequestResponseType, progress: Progress) {
        let xhr = new XMLHttpRequest();
        if(dataType)
            xhr.responseType = dataType;
        if(progress) {
            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    progress.setCompleted(evt.loaded)
                    progress.setTarget(evt.total)
                }
            }, false);
        }
        return () => xhr
    }

    static download(url: string, handler: (response: ArrayBuffer) => void, dataType: XMLHttpRequestResponseType): Progress {

        let progress = new Progress()

        let request = $.ajax({
            url: url,
            xhr: this.getXHR(dataType, progress)
        }).done((msg) => {
            handler(msg)
        }).fail((response, _status, error) => {
            progress.fail(error)
        })

        progress.on("abort", () => request.abort())

        return progress
    }
}