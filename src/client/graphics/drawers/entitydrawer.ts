import TextureProgram from "../programs/textureprogram";
import ClientEntity from "../../entity/cliententity";

class EntityDrawer {
	public entity: any;

    constructor(entity: ClientEntity) {
        this.entity = entity
    }

    /**
     * Draws the specified entity.
     */
    draw(program: TextureProgram) {}
}

export default EntityDrawer;