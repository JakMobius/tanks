
declare module '*.glsl' {
    const shader: string;
    export default shader;
}

declare module '*/%' {
    const modules: any[];
    export default modules;
}

declare module '*/%/client-prefab.ts' {
    const modules: any[];
    export default modules;
}

declare module '*/%/server-prefab.ts' {
    const modules: any[];
    export default modules;
}

declare module '*%.texture.png' {
    const textures: string[];
    export default textures;
}

declare module '*.texture.png' {
    const textureName: string;
    export default textureName;
}