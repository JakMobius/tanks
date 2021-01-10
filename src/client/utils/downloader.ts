
import Progress from './progress';

class Downloader {
	public index: any;

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

    static download(urls: string[], handler: ((response: ArrayBuffer, index: number) => void), dataType: any, progress: Progress) {
        return new Promise((resolve, reject) => {
            let requests: JQuery.jqXHR[] = []
            let awaiting = urls.length
            let cancelled = false
            const assetReady = () => { if(!--awaiting) resolve() }

            for(let [i, url] of urls.entries()) {
                if(cancelled) break
                let taskProgress = null
                if(progress) {
                    taskProgress = new Progress()
                    progress.addSubtask(taskProgress)
                }

                let taskIndex: number = i

                requests.push(
                    $.ajax({
                        url: url,
                        xhr: this.getXHR(dataType, taskProgress)
                    }).done(function(msg){
                        if(cancelled) return
                        handler(msg, taskIndex)
                        assetReady()
                    }).fail(function(response, _status, error){
                        if(cancelled) return
                        cancelled = true
                        let reason = "Failed to download " + urls[taskIndex] + ": " + error

                        for(let request of requests) {
                            if(request !== this) request.abort()
                        }

                        reject(reason)
                    })
                )
            }
        })
    }
}

export default Downloader;