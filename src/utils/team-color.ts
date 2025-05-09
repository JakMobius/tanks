import Color from "./color";

// let colors = [
//     "hsl(0,  100%, 40%)",
//     "hsl(198,100%, 44%)",
//     "hsl(100,100%, 40%)",
//     "hsl(52, 100%, 40%)",
//     "hsl(287,100%, 40%)",
// ]

export default class TeamColor {
    static teamColorSaturation = 1.0
    static teamColorLuminance = 0.4

    static teamHues = [
        0,
        0.55,
        0.27,
        0.14,
        0.79
    ]

    static teamNames = [
        "красных",
        "синих",
        "зеленых",
        "желтых",
        "фиолетовых",
    ]

    static teamColors = TeamColor.teamHues.map((hue) => {
        return new Color().setHSL(hue, TeamColor.teamColorSaturation, TeamColor.teamColorLuminance)
    })

    static noTeamColor = new Color().setRGB(0.5, 0.5, 0.5)
    
    static getColor(id: number) {
        if(id in this.teamColors) return this.teamColors[id]
        return this.noTeamColor    
    }
}