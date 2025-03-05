import "./scene-entity-library.scss"

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tree, TreeApi } from '../react-arborist/src/index';
import { TreeViewContainer, TreeViewRow, TreeViewNode, TreeViewCursor, TreeNodeBase, TreeViewDragPreview } from "../tree-view/tree-view";
import Entity from "src/utils/ecs/entity";
import { EntityType } from "src/entity/entity-type";
import { getPrefabNameForId } from "src/entity/components/prefab-id-component";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";

interface LibraryTreeNode extends TreeNodeBase {
    prefab?: (entity: Entity) => void,
    children?: LibraryTreeNode[]
}

interface LibraryTreeNodeConfig {
    name?: string
    prefab?: number,
    children?: LibraryTreeNodeConfig[]
}

export class SceneEntityLibraryDropItem {
    prefabs: Array<(entity: Entity) => void>
    constructor(prefabs: Array<(entity: Entity) => void>) {
        this.prefabs = prefabs
    }
}

function createLibraryTree(config: LibraryTreeNodeConfig, id: string = "root"): LibraryTreeNode {
    let name = config.name ?? getPrefabNameForId(config.prefab)
    let children = config.children?.map((childConfig, index) => {
        return createLibraryTree(childConfig, id + "/" + String(index))   
    }) ?? []
    let prefab = config.prefab ? (entity: Entity) => {
        return ServerEntityPrefabs.types.get(config.prefab)(entity)
    } : null

    return { id, name, children, prefab }
}

const SceneEntityLibrary: React.FC = () => {

    const rootNode = useMemo(() => {
        let rootNode: LibraryTreeNodeConfig = {
            name: "",
            prefab: null,
            children: [{
                prefab: EntityType.TILEMAP,
            }, {
                name: "Режимы",
                children: [
                    { prefab: EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY },
                    { prefab: EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY },
                    { prefab: EntityType.DM_GAME_MODE_CONTROLLER_ENTITY }
                ],
            }, {
                name: "Зона спавна"
            }]
        }

        return createLibraryTree(rootNode)
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