import PageLocation from "src/client/scenes/page-location";
import React, { createContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client"
import SoundEngine from "../sound/sound-engine";
import RenderLoop from "src/utils/loop/render-loop";
import CanvasHandler from "../graphics/canvas-handler";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface SceneControlerProps {
    setTitle?: (value: string | undefined) => void
    children?: React.ReactNode
}

export interface SceneContextProps {
    canvas: CanvasHandler,
    soundEngine: SoundEngine,
    loop: RenderLoop,
    root: HTMLDivElement,
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

export const SceneContainer: React.FC<SceneControlerProps> = (props) => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const rootRef = useRef<HTMLDivElement | null>(null)
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

        const updateSize = () => {
            canvasHandler.setSizeNextFrame(canvas.clientWidth, canvas.clientHeight)
        }

        const observer = new ResizeObserver(updateSize)
        observer.observe(canvas)
        updateSize()

        setState(state => ({
            ...state,
            canvas: canvasHandler,
            soundEngine: soundEngine,
            root: rootRef.current,
            loop: loop
        }))

        return () => {
            audioContext.close()
            observer.disconnect()
        }
    }, [])

    useEffect(() => setState(state => ({
        ...state,
        setTitle: props.setTitle,
        root: rootRef.current,
    })), [props.setTitle, rootRef.current])

    return (
        // Map editor uses DnD, so we need to wrap the whole thing in a DnDProvider
        <DndProvider
                backend={HTML5Backend}
                options={{ rootElement: document.body || undefined }}
                >
            <SceneContext.Provider value={state}>
                <div ref={rootRef} className="game-root">
                    <canvas className="game-canvas" ref={canvasRef}/>
                    {state && props.children}
                </div>
            </SceneContext.Provider>
        </DndProvider>
            
    )
}

const SceneRouter: React.FC = () => {
    const [state, setState] = useState({
        currentSceneName: null as string | null,
        scene: null as React.ReactNode | null
    })
    
    const handleWindowLocation = () => setState(state => {
        let sceneName = PageLocation.getHashJson().page ?? "hub"

        if(sceneName === state.currentSceneName) {
            return state
        }

        state.currentSceneName = sceneName

        const Component = SceneController.shared.sceneDescriptors.get(sceneName)

        if(!Component) {
            PageLocation.navigateToScene("hub")
            return state
        }

        return {
            ...state,
            currentSceneName: sceneName,
            scene: <Component/>
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
    sceneDescriptors: Map<string, React.FC> = new Map()
    root: ReactDOM.Root

    main(root: HTMLElement) {
        // This is the game entrypoint, effectively.
        this.root = ReactDOM.createRoot(root)
        this.root.render(<SceneContainer
            setTitle={(title) => {
                document.title = title ?? "Танчики"
            }}
        >
            <SceneRouter/>
        </SceneContainer>)
    }

    registerScene(name: string, component: React.FC) {
        this.sceneDescriptors.set(name, component)
    }
}