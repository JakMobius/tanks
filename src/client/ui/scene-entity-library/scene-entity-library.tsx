import "./scene-entity-library.scss"

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tree, TreeApi } from '../react-arborist/src/index';
import { TreeViewContainer, TreeViewRow, TreeViewNode, TreeViewCursor, TreeNodeBase, TreeViewDragPreview } from "../tree-view/tree-view";
import Entity from "src/utils/ecs/entity";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";

interface LibraryTreeNode extends TreeNodeBase {
    prefab?: (entity: Entity) => void,
    children?: LibraryTreeNode[]
}

class VirtualLibraryTree {
    prefabs: EntityPrefab[] = []
    subgroups = new Map<string, VirtualLibraryTree>()

    add(path: string, prefab: EntityPrefab) {
        let parts = path.split("/")
        let group: VirtualLibraryTree = this

        for(let part of parts) {
            let subgroup = group.subgroups.get(part)
            if(subgroup === undefined) {
                subgroup = new VirtualLibraryTree()
                group.subgroups.set(part, subgroup)
            }
            group = subgroup
        }

        group.prefabs.push(prefab)
        return
    }
}

export class SceneEntityLibraryDropItem {
    prefabs: Array<(entity: Entity) => void>
    constructor(prefabs: Array<(entity: Entity) => void>) {
        this.prefabs = prefabs
    }
}

function createLibraryTree(tree: VirtualLibraryTree, id: string = "root"): LibraryTreeNode {
    
    let children = []

    for(let [name, subgroup] of tree.subgroups) {
        let subtree = createLibraryTree(subgroup, id + "/" + name)
        subtree.name = name
        children.push(subtree)
    }

    for(let prefab of tree.prefabs) {
        let childId = id + "/" + prefab.id
        children.push({ id: childId, prefab: prefab.prefab, name: prefab.getDisplayName() })
    }

    return { id, children, name: "" }
}

const SceneEntityLibrary: React.FC = () => {

    const rootNode = useMemo(() => {
        let tree = new VirtualLibraryTree()

        for(let prefab of ClientEntityPrefabs.prefabs.values()) {
            if(prefab.metadata.editorPath === undefined) continue
            let correspondingServerPrefab = ServerEntityPrefabs.getById(prefab.id)
            tree.add(prefab.metadata.editorPath, correspondingServerPrefab)
        }

        return createLibraryTree(tree)
    }, [])

    const treeRef = useRef<TreeApi<LibraryTreeNode> | null>(null)
    const divRef = useRef<HTMLDivElement | null>(null)
    const [height, setHeight] = useState<number | null>(null)
    const [treeRoot, setTreeRoot] = useState(rootNode)

    useEffect(() => {
        if(!divRef.current) return undefined
        let observer = new ResizeObserver(() => {
            setHeight(divRef.current.clientHeight)
        })
        setHeight(divRef.current.clientHeight)
        observer.observe(divRef.current)
        return () => observer.disconnect()
    }, [divRef.current])

    const disableDrag = (node: LibraryTreeNode) => {
        return node.prefab === null
    }

    const dragItemUserData = (nodes: LibraryTreeNode[]) => {
        return new SceneEntityLibraryDropItem(nodes.map(node => node.prefab))
    }

    return (
        <div className="tree-view" ref={divRef}>
            {height !== null ? <Tree
                data={treeRoot.children}
                selectionFollowsFocus={true}
                ref={treeRef}
                renderCursor={TreeViewCursor}
                renderContainer={TreeViewContainer}
                renderDragPreview={TreeViewDragPreview}
                renderRow={TreeViewRow}
                rowHeight={27}
                height={height}
                disableDrop={true}
                disableEdit={true}
                disableDrag={disableDrag}
                dragItemUserData={dragItemUserData}
            >
                {TreeViewNode}
            </Tree> : null}
        </div>
    )
}

export default SceneEntityLibrary