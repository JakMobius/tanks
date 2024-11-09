
export default class PageLocation {
    public static getHashJson() {
        try {
            return JSON.parse(decodeURIComponent(location.hash.slice(1)))
        } catch {
            return {}
        }
    }

    public static navigateToScene(name: string, config: any = null) {
        config = Object.assign({
            page: name
        }, config)
        window.location.hash = encodeURIComponent(JSON.stringify(config))
    }
}