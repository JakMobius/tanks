import { PackedEntity, readEntityFile } from "src/map/map-serialization"

export function readMapFromFile(file: File): Promise<PackedEntity> {
    return new Promise<PackedEntity>((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = () => {
            try {
                let json = JSON.parse(reader.result as string)
                resolve(readEntityFile(json))
            } catch(e) {
                console.error(e)
                reject(e)
            }
        }
        reader.onerror = (e) => {
            reject(e)
        }
        reader.readAsText(file)
    })
}

export function readMapFromDialog(): Promise<PackedEntity> {
    let input = document.createElement("input");
    input.setAttribute("type", "file");
    input.click()
    
    return new Promise<PackedEntity>((resolve, reject) => {
        input.onchange = () => {
            let file = input.files[0]
            if(file) {
                readMapFromFile(file).then(resolve).catch(reject)
            } else {
                reject()
            }
            input.remove()
        }
    })
}