
export function downloadFile(filename: string, json: any): void {
    let text = JSON.stringify(json, null, 2)
    const blob = new Blob([text], {type: 'application/json'});

    // @ts-ignore
    if(window.navigator.msSaveOrOpenBlob) {
        // @ts-ignore
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
        URL.revokeObjectURL(elem.href);
    }
}