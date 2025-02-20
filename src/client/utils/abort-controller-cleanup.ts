import { useEffect, useMemo } from "react"

export const useAbortControllerCleanup = () => {
    const cleanup = useMemo(() => new Set<AbortController>(), [])
    const addCleanup = (controller: AbortController) => cleanup.add(controller)
    const removeCleanup = (controller: AbortController) => cleanup.delete(controller)
    useEffect(() => () => cleanup.forEach(controller => controller.abort()), [])
    return { addCleanup, removeCleanup }
}