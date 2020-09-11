
const Progress = require("./progress")

class Downloader {
    static getXHR(dataType, progress) {
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

    static download(urls, handler, dataType, progress) {
        return new Promise((resolve, reject) => {
            let requests = []
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

                requests.push(
                    $.ajax({
                        url: url,
                        index: i,
                        xhr: this.getXHR(dataType, taskProgress)
                    }).done(function(){
                        if(cancelled) return
                        handler.apply(this, arguments)
                        assetReady()
                    }).fail(function(response, status, error){
                        if(cancelled) return
                        cancelled = true
                        let reason = "Failed to download " + urls[this.index] + ": " + error

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

module.exports = Downloader