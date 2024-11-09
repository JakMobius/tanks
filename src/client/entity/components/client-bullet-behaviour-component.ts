import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export interface ClientBulletBehaviourConfig {
    hideOnContact: boolean
}

export default class ClientBulletBehaviourComponent extends EventHandlerComponent {
    public visible: boolean;

    constructor(config?: ClientBulletBehaviourConfig) {
        super()

        config = Object.assign({
            hideOnContact: true
        }, config)

        this.eventHandler.on("server-position-received", () => {
            this.visible = true
        })

        if(config.hideOnContact) {
            this.eventHandler.on("physical-contact-begin", () => {
                this.visible = false
            })
        }
    }
}