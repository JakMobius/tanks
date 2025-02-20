import LoadingScene from "src/client/scenes/loading/loading-scene";
import {SceneDescriptor} from "src/client/scenes/scene-descriptor";
import PageLocation from "src/client/scenes/page-location";
import {Progress} from "src/client/utils/progress";

import React, { createContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client"
import SoundEngine from "../sound/sound-engine";
import Loop from "src/utils/loop/loop";
import RenderLoop from "src/utils/loop/render-loop";
import CanvasHandler from "../graphics/canvas-handler";

interface SceneControlerProps {
    setTitle?: (value: string | undefined) => void
}

export interface SceneContextProps {
    canvas: CanvasHandler,
    soundEngine: SoundEngine,
    loop: RenderLoop,
    setTitle?: (value: string | undefined) => void
}

const SceneContext = createContext<SceneContextProps | undefined>(undefined)

export function useScene() {
    const context = React.useContext(SceneContext)
    if (!context) {
        throw new Error('useScene must be used within a SceneContainer');
    }
    return context;
}

const SceneContainer: React.FC<SceneControlerProps> = (props) => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [state, setState] = useState<SceneContextProps | null>(null)

    useEffect(() => {
        const audioContext = new AudioContext()
        const soundEngine = new SoundEngine(audioContext)
        soundEngine.input.connect(audioContext.destination)

        const canvas = canvasRef.current
        const canvasHandler = new CanvasHandler(canvas)
        
        const loop = new RenderLoop({
            timeMultiplier: 0.001,
            maximumTimestep: 0.1
        })

        const observer = new ResizeObserver((value) => canvasHandler.updateSize())
        observer.observe(canvas)
        canvasHandler.updateSize()

        setState(state => ({
            ...state,
            canvas: canvasHandler,
            soundEngine: soundEngine,
            loop: loop
        }))

        return () => {
            audioContext.close()
            observer.disconnect()
        }
    }, [])

    useEffect(() => setState(state => ({
        ...state,
        setTitle: props.setTitle
    })), [props.setTitle])

    return (
        <SceneContext.Provider value={state}>
            <canvas className="game-canvas" ref={canvasRef}/>
            {state && <SceneRouter/>}
        </SceneContext.Provider>
    )
}

const SceneRouter: React.FC = () => {
    const scene = useScene()

    const [state, setState] = useState({
        currentlyLoading: false,
        currentSceneName: null as string | null,
        scene: null as React.ReactNode | null
    })
    
    const handleWindowLocation = () => setState(state => {
        if(state.currentlyLoading) return state

        let sceneName = PageLocation.getHashJson().page ?? "hub"

        if(sceneName === state.currentSceneName) {
            return state
        }

        state.currentSceneName = sceneName

        const descriptorFactory = SceneController.shared.sceneDescriptors.get(sceneName)

        if(!descriptorFactory) {
            PageLocation.navigateToScene("hub")
            return state
        }

        const descriptor = descriptorFactory()

        const prerequisites = descriptor.prerequisites.map(resource => {
            return () => {
                console.log(resource.getLocalizedDescription())
                return resource.resolve(scene)
            }
        })

        const progress = Progress.sequential(prerequisites)

        const onLoad = () => {
            setState(state => ({
                ...state,
                currentlyLoading: false,
                scene: descriptor.createScene()
            }))
            handleWindowLocation()
        }
    
        const onLoadingError = (error: any) => {
            setState(state => ({
                ...state,
                currentlyLoading: false,
                scene: <LoadingScene error={error}/>
            }))
            handleWindowLocation()
        }

        progress.on("completed", onLoad)
        progress.on("error", onLoadingError)

        return {
            ...state,
            currentlyLoading: true,
            currentSceneName: sceneName,
            scene: <LoadingScene progress={progress}/>
        }
    })

    useEffect(() => {
        handleWindowLocation()

        addEventListener("hashchange", handleWindowLocation)
        return () => removeEventListener("hashchange", handleWindowLocation)
    }, [])

    return state.scene
}

export default class SceneController {
    static shared: SceneController = new SceneController()
    sceneDescriptors: Map<string, () => SceneDescriptor> = new Map()
    root: ReactDOM.Root

    main(root: HTMLElement) {
        // This is the game entrypoint, effectively.
        this.root = ReactDOM.createRoot(root)
        this.root.render(<SceneContainer
            setTitle={(title) => document.title = title}
        />)
    }

    registerScene(name: string, descriptorFactory: () => SceneDescriptor) {
        this.sceneDescriptors.set(name, descriptorFactory)
    }
}