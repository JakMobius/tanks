import "./scene-tree-view.scss"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CreateHandler, DeleteHandler, DropHandler, NodeApi, RenameHandler, Tree, TreeApi } from '../react-arborist/src/index';
import Entity from 'src/utils/ecs/entity';
import { TreeViewContainer, TreeViewRow, TreeViewNode, TreeViewCursor, TreeViewDragPreview } from "../tree-view/tree-view";
import { EntityEditorTreeNodeComponent, EntityEditorTreeRootComponent, EntityTreeNode } from "./components";
import { SceneEntityLibraryDropItem } from "../scene-entity-library/scene-entity-library";
import { useMapEditorScene } from "src/client/map-editor/map-editor-scene";

const SceneTreeView: React.FC = () => {

    const editorScene = useMapEditorScene()

    const rootEntity = useMemo(() => {
        if(!editorScene.game) return null
        let rootEntity = editorScene.game.serverGame
        if(!rootEntity.getComponent(EntityEditorTreeNodeComponent)) {
            rootEntity.addComponent(new EntityEditorTreeNodeComponent())
        }
        if(!rootEntity.getComponent(EntityEditorTreeRootComponent)) {
            rootEntity.addComponent(new EntityEditorTreeRootComponent())
        }
        return rootEntity
    }, [editorScene.game?.serverGame])

    const treeRef = useRef<TreeApi<EntityTreeNode> | null>(null)
    const divRef = useRef<HTMLDivElement | null>(null)
    const [height, setHeight] = useState<number | null>(null)

    const getNodeById = (id: string) => {
        if (id === null) return rootEntity?.getComponent(EntityEditorTreeNodeComponent)
        let entity = rootEntity?.getComponent(EntityEditorTreeRootComponent).map.get(id)
        return entity?.getComponent(EntityEditorTreeNodeComponent)
    }

    const getRoot = () => {
        return rootEntity?.getComponent(EntityEditorTreeNodeComponent).getDescriptor()
    }

    const [treeRoot, setTreeRoot] = useState(getRoot())

    const updateRoot = () => setTreeRoot(getRoot())

    useEffect(() => updateRoot(), [rootEntity])

    const onRename: RenameHandler<EntityTreeNode> = ({ id, name }) => {
        getNodeById(id)?.setName(name)
        editorScene.update()
        updateRoot()
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
            editorScene.update()
            updateRoot()
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
                prefab(entity)
                parent.insertChildAfter(entity, after)
                entities.push(entity)
                let id = entity.getComponent(EntityEditorTreeNodeComponent).id
                ids.push(id)
                after = entity
            }
            editorScene.update()
            updateRoot()
            treeRef.current?.focus(ids[0])
            treeRef.current?.setSelection({ ids: ids, anchor: null, mostRecent: null })

            // onFocus is not called in this case. TODO: fix in react-arborist
            editorScene.selectEntity(entities[0])
        }
    }

    const onDelete: DeleteHandler<EntityTreeNode> = ({ ids }) => {
        for (let id of ids) {
            getNodeById(id)?.entity.removeFromParent()
        }
        editorScene.selectEntity(null)
        editorScene.update()
        updateRoot()
    };

    const onFocus = useCallback((node: NodeApi<EntityTreeNode>) => {
        editorScene.selectEntity(node.data.entity)
    }, [])

    useEffect(() => {
        if(!divRef.current) return undefined
        let observer = new ResizeObserver(() => {
            setHeight(divRef.current.clientHeight)
        })
        setHeight(divRef.current.clientHeight)
        observer.observe(divRef.current)
        return () => observer.disconnect()
    }, [divRef.current])

    return (
        <div className="tree-view" ref={divRef}>
            {height !== null ? <Tree
                data={treeRoot?.children}
                onRename={onRename}
                onDrop={onDrop}
                onDelete={onDelete}
                onFocus={onFocus}
                ref={treeRef}
                renderCursor={TreeViewCursor}
                renderContainer={TreeViewContainer}
                renderDragPreview={TreeViewDragPreview}
                renderRow={TreeViewRow}
                rowHeight={27}
                height={height}
                selectionFollowsFocus={true}
            >
                {TreeViewNode}
            </Tree> : null}
        </div>
    )
}

export default SceneTreeView