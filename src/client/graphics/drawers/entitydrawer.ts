
class EntityDrawer {
	public entity: any;

    constructor(entity) {
        this.entity = entity
    }

    /**
     * Draws the specified entity.
     * @param program {TextureProgram}
     */
    draw(program) {}
}

export default EntityDrawer;