
import Rectangle from '../utils/rectangle';

export class Spawnzone extends Rectangle {
	public team: number;

    constructor(team: number) {
        super()
        this.team = team
    }

    sample() {
        const x = (Math.random() * (this.x2 - this.x1) + this.x1);
        const y = (Math.random() * (this.y2 - this.y1) + this.y1);

        return {x: x, y: y}
    }
}