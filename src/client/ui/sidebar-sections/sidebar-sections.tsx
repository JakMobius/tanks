import { createContext, useCallback, useEffect, useRef, useState } from "react";
import "./sidebar-sections.scss"
import React from "react";

export  interface SidebarSectionHeight {
    min: number
    current: number
    collapsed: boolean
}

export interface SidebarSectionContextProps {
    savedHeight: number
    height: number
    collapse: () => void
    expand: () => void
    dragEdge: (dy: number) => void
}

export const SidebarSectionContext = createContext<SidebarSectionContextProps | null>(null)

export interface SidebarSectionsProps {
    sections: number
    sectionContent: (index: number) => React.ReactNode
    minSectionHeight: number
    collapsedSectionHeight: number
}

export const SidebarSections: React.FC<SidebarSectionsProps> = (props) => {

    const divRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState({
        sectionHeights: null as SidebarSectionHeight[] | null,
        sectionContexts: null as SidebarSectionContextProps[],
        height: null as number | null
    })
    const stateRef = useRef(state)

    const updateSizesProportional = (heights: SidebarSectionHeight[], newHeight: number) => {
        let totalMinHeight = heights.reduce((a, b) => a + b.min, 0)
        let totalCurrentHeight = heights.reduce((a, b) => a + b.current, 0)
        let notCollapsedSections = heights.reduce((a, b) => a + Number(!b.collapsed), 0)

        let newAvailableHeight = newHeight - totalMinHeight
        let oldAvailableHeight = totalCurrentHeight - totalMinHeight

        if(newAvailableHeight < 0) newAvailableHeight = 0
        if(oldAvailableHeight < 0) oldAvailableHeight = 0

        return heights.map(oldHeight => {
            if(oldHeight.collapsed) return oldHeight

            if(newAvailableHeight === 0) {
                return {
                    min: oldHeight.min,
                    current: oldHeight.min,
                    collapsed: false
                }
            }

            let availableHeight = oldHeight.current - oldHeight.min

            if(oldAvailableHeight === 0) {
                availableHeight = newAvailableHeight / notCollapsedSections
            } else {
                availableHeight *= (newAvailableHeight / oldAvailableHeight)
            }

            return {
                min: oldHeight.min,
                current: oldHeight.min + availableHeight,
                collapsed: false
            }
        })
    }

    const updateSizesOrdered = (heights: SidebarSectionHeight[], delta: number, bottomToTop: boolean) => {
        if(!heights.length) return { heights: [], deltaLeft: delta }

        let result = Array(heights.length)
        let yetToExpand = delta
        let index = bottomToTop ? heights.length - 1 : 0

        while(true) {
            let height = heights[index]
            let oldHeight = height.current
            let newHeight = oldHeight
            if(!height.collapsed) {
                newHeight = Math.max(height.min, height.current + yetToExpand)
            }
            if(oldHeight === newHeight) result[index] = height
            else result[index] = ({ ...height, current: newHeight })
            yetToExpand += oldHeight - newHeight

            if(bottomToTop) {
                if(index-- === 0) break
            } else {
                if(++index === heights.length) break
            }
        }

        return { heights: result, deltaLeft: yetToExpand }
    }

    const dragSectionEdge = useCallback((index: number, delta: number) => {
        setState(state => {
            let headHeights = state.sectionHeights.slice(0, index + 1)
            let tailHeights = state.sectionHeights.slice(index + 1)

            let resHead = updateSizesOrdered(headHeights, delta, true);
            let resTail = updateSizesOrdered(tailHeights, -(delta - resHead.deltaLeft), false);

            if(resTail.deltaLeft !== 0) {
                delta -= resHead.deltaLeft - resTail.deltaLeft;
                resHead = updateSizesOrdered(headHeights, delta, true);
                resTail = updateSizesOrdered(tailHeights, -delta, false);
            }

            return { ...state, sectionHeights: [
                ...resHead.heights,
                ...resTail.heights
            ]}
        })
    }, [])

    const setSectionHeight = useCallback((index: number, height: number, minHeight: number, collapsed: boolean) => {
        setState(state => {
            let headHeights = state.sectionHeights.slice(0, index)
            let currentHeights = { ...state.sectionHeights[index] }
            let tailHeights = state.sectionHeights.slice(index + 1)

            let freeSpace = state.height - state.sectionHeights.reduce((a, b) => a + b.current, 0)
            freeSpace -= height - currentHeights.current

            if(collapsed) height = minHeight
            currentHeights.collapsed = collapsed
            currentHeights.current = height
            currentHeights.min = minHeight

            let resTail = updateSizesOrdered(tailHeights, freeSpace, false);
            tailHeights = resTail.heights
            
            if(resTail.deltaLeft !== 0) {
                let resHead = updateSizesOrdered(headHeights, resTail.deltaLeft, true)
                headHeights = resHead.heights

                if(resHead.deltaLeft > 0 && !collapsed) {
                    currentHeights.current += resTail.deltaLeft
                }
            }

            return { ...state, sectionHeights: [
                ...headHeights,
                currentHeights,
                ...tailHeights
            ]}
        })
    }, [])

    const updateHeight = useCallback((newHeight: number) => {
        setState((state) => {
            let newHeights: SidebarSectionHeight[]

            if(state.sectionHeights === null) {
                let sectionHeight = newHeight / props.sections
                newHeights = Array.from({length: props.sections}).map((_, i) => ({
                    min: props.minSectionHeight,
                    current: sectionHeight,
                    collapsed: false
                }))
            } else {
                newHeights = updateSizesProportional(state.sectionHeights, newHeight)
            }

            return {
                ...state,
                sectionHeights: newHeights,
                height: newHeight
            }
        })
    }, [props.sections])

    const getContextFor = (section: number) => {
        return {
            ...state.sectionContexts?.[section],
            height: state.sectionHeights[section].current,
            collapse() {
                let heights = stateRef.current.sectionHeights
                let contexts = stateRef.current.sectionContexts
                if(heights[section].collapsed) return
                let height = heights[section].current
                contexts[section].savedHeight = height
                setSectionHeight(section, props.collapsedSectionHeight, props.collapsedSectionHeight, true)
            },
            expand() {
                let heights = stateRef.current.sectionHeights
                let contexts = stateRef.current.sectionContexts
                if(!heights[section].collapsed) return
                let height = contexts[section].savedHeight ?? props.minSectionHeight
                setSectionHeight(section, height, props.minSectionHeight, false)
            },
            dragEdge(dy) {
                dragSectionEdge(section, dy)
            },
        } as SidebarSectionContextProps
    }

    useEffect(() => {
        if(!state.sectionHeights) return
        setState((state) => {
            let newContexts: SidebarSectionContextProps[] = []
            for(let i = 0; i < props.sections; i++) {
                let oldHeight = state.sectionContexts?.[i].height
                let currentHeight = state.sectionHeights[i]
                if(oldHeight === currentHeight.current) {
                    newContexts.push(state.sectionContexts[i])
                } else {
                    newContexts.push(getContextFor(i))
                }
            }
            
            let newState = {
                ...state,
                sectionContexts: newContexts
            }
            stateRef.current = newState
            return newState
        })
    }, [state.sectionHeights])

    useEffect(() => {
        if(!divRef.current) return undefined
        let div = divRef.current
        let resizeObserver = new ResizeObserver(() => {
            updateHeight(div.clientHeight)
        })
        updateHeight(div.clientHeight)
        resizeObserver.observe(div)
        return () => resizeObserver.disconnect()
    }, [divRef.current])

    return (
        <div className="sidebar-sections" ref={divRef}>
            { state.sectionContexts !== null ? Array.from({ length: props.sections }).map((_, i) => (
                <SidebarSectionContext.Provider key={i} value={state.sectionContexts[i]}>
                    {props.sectionContent(i)}
                </SidebarSectionContext.Provider>
            )) : null }
        </div>
    )
}