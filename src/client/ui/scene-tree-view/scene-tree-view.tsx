import "./scene-tree-view.scss"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DeleteHandler, DropHandler, NodeApi, RenameHandler, Tree, TreeApi } from '../react-arborist/src/index';
import Entity from 'src/utils/ecs/entity';
import { TreeViewContainer, TreeViewRow, TreeViewNode, TreeViewCursor, TreeViewDragPreview } from "../tree-view/tree-view";
import { EntityEditorTreeNodeComponent, EntityTreeNode } from "./components";
import { SceneEntityLibraryDropItem } from "../scene-entity-library/scene-entity-library";
import { useMapEditorScene } from "src/client/map-editor/map-editor-scene";
import { ControlsProvider } from "src/client/utils/react-controls-responder";

export class SceneTreeViewDropItem {
    entities: Entity[]
    constructor(entities: Entity[]) {
        this.entities = entities
    }
}

const SceneTreeView: React.FC = () => {

    const editorScene = useMapEditorScene()

    const serverMapEntity = editorScene.serverMapEntity

    const treeRef = useRef<TreeApi<EntityTreeNode> | null>(null)
    const divRef = useRef<HTMLDivElement | null>(null)
    // TODO: come up with a better solution
    // Virtuoso updates its internal state in useLayoutEffect. Since effects are called
    // for children first, Virtuoso will update its state before the root node is updated.
    // While the internal Virtuoso state is misaligned with the root node, the react-arborist
    // might be asked to render a note that is out of bounds in case the row count is decreased.
    const [_, rerender] = useState({})
    const [height, setHeight] = useState<number | null>(null)

    const getNodeById = (id: string) => {
        let rootNode = serverMapEntity?.getComponent(EntityEditorTreeNodeComponent)
        if (id === null) return rootNode
        let targetEntity = rootNode.root?.map.get(id)
        return targetEntity?.getComponent(EntityEditorTreeNodeComponent)
    }

    const getRoot = () => {
        return serverMapEntity?.getComponent(EntityEditorTreeNodeComponent).getDescriptor()
    }

    const onRename: RenameHandler<EntityTreeNode> = ({ id, name }) => {
        getNodeById(id)?.setName(name)
        editorScene.update()
    };

    const onDrop: DropHandler<EntityTreeNode> = ({ item, parentId, index }) => {
        if(item.tree === treeRef.current) {
            let dragIds = treeRef.current.state.dnd.dragIds
            let parent = getNodeById(parentId)?.entity
            if(!parent) return
            let after = index === 0  ? null : parent.children[index - 1]
            for (let id of dragIds) {
                let node = getNodeById(id)
                let entity = node.entity
                if (after !== entity) {
                    entity.removeFromParent()
                    parent.insertChildAfter(entity, after)
                }
                after = entity
            }
        } else if(item.userData instanceof SceneEntityLibraryDropItem) {
            let dropItem = item.userData as SceneEntityLibraryDropItem
            if(dropItem.prefabs.length === 0) return

            let parent = getNodeById(parentId)?.entity
            if(!parent) return
            let after = index === 0  ? null : parent.children[index - 1]

            let ids: string[] = []
            let entities: Entity[] = []
            for(let prefab of dropItem.prefabs) {
                let entity = new Entity()
                prefab.prefab(entity)
                if(!entity) continue
                parent.insertChildAfter(entity, after)
                entities.push(entity)
                let id = entity.getComponent(EntityEditorTreeNodeComponent).id
                ids.push(id)
                after = entity
            }

            // onFocus is not called in this case. TODO: fix in react-arborist
            editorScene.selectEntities(entities)
        }
    }

    const onDelete: DeleteHandler<EntityTreeNode> = ({ ids }) => {
        for (let id of ids) {
            getNodeById(id)?.entity.removeFromParent()
        }
        editorScene.selectEntities([])
    };

    const onSelect = useCallback((nodes: NodeApi<EntityTreeNode>[]) => {
        editorScene.selectEntities(nodes.map(node => node.data.entity))
    }, [])

    useEffect(() => {
        if(!treeRef.current) return

        let ids = editorScene.selectedServerEntities.map((node) => {
            return node?.getComponent(EntityEditorTreeNodeComponent)?.id
        }).filter(node => node !== undefined)
        
        // Since tree maintains its own selection state, the selection should be compared
        // with the current selection state and only updated if necessary in order to break
        // infinite recursion. TODO: allow external selection state in react-arborist

        // Luckily, the selected sets are stored in a set, so we can compare them in O(n)
        let matches = true
        for(let id of ids) {
            if(!treeRef.current.selectedIds.has(id)) {
                matches = false
                break
            }
        }
        
        if(matches && ids.length === treeRef.current.selectedIds.size) {
            return
        }

        treeRef.current?.setSelection({ ids: ids, anchor: null, mostRecent: ids[0] ?? null })
        
    }, [editorScene.selectedServerEntities])

    useEffect(() => {
        if(!divRef.current) return undefined
        let observer = new ResizeObserver(() => {
            setHeight(divRef.current.clientHeight)
        })
        setHeight(divRef.current.clientHeight)
        observer.observe(divRef.current)
        return () => observer.disconnect()
    }, [divRef.current])

    useEffect(() => {
        if(!editorScene.serverMapEntity) return undefined
        const dirtyHandler = () => {
            rerender({})
            editorScene.update()
        }
        editorScene.serverMapEntity.on("tree-node-dirty", dirtyHandler)
        return () => editorScene.serverMapEntity.off("tree-node-dirty", dirtyHandler)
    }, [editorScene.serverMapEntity])

    const dragItemUserData = (nodes: EntityTreeNode[]) => {
        return new SceneTreeViewDropItem(nodes.map(node => node.entity))
    }

    return (
        <ControlsProvider default>
            <div className="tree-view" ref={divRef}>
                {height !== null ? <Tree
                    data={getRoot()?.children}
                    onRename={onRename}
                    onDrop={onDrop}
                    onDelete={onDelete}
                    onSelect={onSelect}
                    ref={treeRef}
                    renderCursor={TreeViewCursor}
                    renderContainer={TreeViewContainer}
                    renderDragPreview={TreeViewDragPreview}
                    renderRow={TreeViewRow}
                    rowHeight={27}
                    height={height}
                    // selectionFollowsFocus
                    dragItemUserData={dragItemUserData}
                >
                    {TreeViewNode}
                </Tree> : null}
            </div>
        </ControlsProvider>
    )
}

export default SceneTreeView