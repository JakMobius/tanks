import "./scene-tree-view.scss"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CreateHandler, DeleteHandler, DragPreviewProps, DropHandler, MoveHandler, RenameHandler, Tree, TreeApi } from '../react-arborist/src/index';
import Entity from 'src/utils/ecs/entity';
import { TreeViewContainer, TreeViewRow, TreeViewNode, TreeViewCursor, TreeViewDragPreview } from "../tree-view/tree-view";
import { EntityEditorTreeNodeComponent, EntityEditorTreeRootComponent, EntityTreeNode } from "./components";
import { SceneEntityLibraryDropItem } from "../scene-entity-library/scene-entity-library";

const SceneTreeView: React.FC = () => {

    const rootEntity = useMemo(() => {
        let rootEntity = new Entity()
        rootEntity.addComponent(new EntityEditorTreeNodeComponent())
        rootEntity.addComponent(new EntityEditorTreeRootComponent())
        return rootEntity
    }, [])

    const treeRef = useRef<TreeApi<EntityTreeNode> | null>(null)
    const divRef = useRef<HTMLDivElement | null>(null)
    const [height, setHeight] = useState<number | null>(null)

    const getNodeById = (id: string) => {
        if (id === null) return rootEntity.getComponent(EntityEditorTreeNodeComponent)
        let entity = rootEntity.getComponent(EntityEditorTreeRootComponent).map.get(id)
        return entity.getComponent(EntityEditorTreeNodeComponent)
    }

    const getRoot = () => {
        return rootEntity.getComponent(EntityEditorTreeNodeComponent).getDescriptor()
    }

    const updateRoot = () => {
        setTreeRoot(getRoot())
    }

    const [treeRoot, setTreeRoot] = useState(getRoot())

    /* Handle the data modifications outside the tree component */
    const onCreate: CreateHandler<EntityTreeNode> = ({ parentId, index, type }) => {
        return null
    };
    const onRename: RenameHandler<EntityTreeNode> = ({ id, name }) => {
        getNodeById(id).setName(name)
        updateRoot()
    };

    const onDrop: DropHandler<EntityTreeNode> = ({ item, parentId, index }) => {
        if(item.tree === treeRef.current) {
            let dragIds = treeRef.current.state.dnd.dragIds
            let parent = getNodeById(parentId).entity
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
            updateRoot()
        } else if(item.userData instanceof SceneEntityLibraryDropItem) {
            let dropItem = item.userData as SceneEntityLibraryDropItem
            let entity = new Entity()
            dropItem.prefab(entity)
            let parent = getNodeById(parentId).entity
            let after = index === 0  ? null : parent.children[index - 1]
            parent.insertChildAfter(entity, after)
            updateRoot()
        }
    }

    const onDelete: DeleteHandler<EntityTreeNode> = ({ ids }) => {
        for (let id of ids) {
            getNodeById(id).entity.removeFromParent()
        }
        updateRoot()
    };

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
                data={treeRoot.children}
                onCreate={onCreate}
                onRename={onRename}
                onDrop={onDrop}
                onDelete={onDelete}
                selectionFollowsFocus={true}
                ref={treeRef}
                renderCursor={TreeViewCursor}
                renderContainer={TreeViewContainer}
                renderDragPreview={TreeViewDragPreview}
                renderRow={TreeViewRow}
                rowHeight={27}
                height={height}
            >
                {TreeViewNode}
            </Tree> : null}
        </div>
    )
}

export default SceneTreeView