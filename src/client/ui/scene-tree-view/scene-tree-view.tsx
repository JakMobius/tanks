import "./scene-tree-view.scss"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CreateHandler, DeleteHandler, DragPreviewProps, MoveHandler, RenameHandler, Tree, TreeApi } from '../react-arborist/src/index';
import Entity from 'src/utils/ecs/entity';
import { TreeViewContainer, TreeViewRow, SceneTreeViewDragPreview, TreeViewNode, TreeViewCursor } from "../tree-view/tree-view";
import { EntityEditorTreeNodeComponent, EntityEditorTreeRootComponent, EntityTreeNode } from "./components";

const SceneTreeView: React.FC = () => {

    const rootEntity = useMemo(() => {
        let rootEntity = new Entity()
        rootEntity.addComponent(new EntityEditorTreeNodeComponent("Мир"))
        rootEntity.addComponent(new EntityEditorTreeRootComponent())

        let e1 = new Entity()
        e1.addComponent(new EntityEditorTreeNodeComponent("Карта"))
        rootEntity.appendChild(e1)

        let ctf = new Entity()
        ctf.addComponent(new EntityEditorTreeNodeComponent("Режим CTF"))
        rootEntity.appendChild(ctf)

        let dm = new Entity()
        dm.addComponent(new EntityEditorTreeNodeComponent("Режим DM"))
        rootEntity.appendChild(dm)

        let tdm = new Entity()
        tdm.addComponent(new EntityEditorTreeNodeComponent("Режим TDM"))
        rootEntity.appendChild(tdm)

        let race = new Entity()
        race.addComponent(new EntityEditorTreeNodeComponent("Режим RACE"))
        rootEntity.appendChild(race)

        let spawnZones = new Entity()
        spawnZones.addComponent(new EntityEditorTreeNodeComponent("Зоны спавна"))
        rootEntity.appendChild(spawnZones)

        let zone1 = new Entity()
        zone1.addComponent(new EntityEditorTreeNodeComponent("Спавн синих"))
        spawnZones.appendChild(zone1)

        let zone2 = new Entity()
        zone2.addComponent(new EntityEditorTreeNodeComponent("Спавн красных"))
        spawnZones.appendChild(zone2)

        let zone3 = new Entity()
        zone3.addComponent(new EntityEditorTreeNodeComponent("Спавн зеленых"))
        spawnZones.appendChild(zone3)

        let zone4 = new Entity()
        zone4.addComponent(new EntityEditorTreeNodeComponent("Спавн желтых"))
        spawnZones.appendChild(zone4)

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
    const onMove: MoveHandler<EntityTreeNode> = ({ dragIds, parentId, index }) => {
        let parent = getNodeById(parentId).entity
        let after = index === 0 ? null : parent.children[index - 1]
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
    };
    const onDelete: DeleteHandler<EntityTreeNode> = ({ ids }) => {
        for (let id of ids) {
            getNodeById(id).entity.removeFromParent()
        }
        updateRoot()
    };

    const renderDragPreview = useCallback((props: DragPreviewProps) => {
        return SceneTreeViewDragPreview({ tree: treeRef.current, ...props })
    }, [treeRef])

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
                onMove={onMove}
                onDelete={onDelete}
                selectionFollowsFocus={true}
                ref={treeRef}
                renderDragPreview={renderDragPreview}
                renderCursor={TreeViewCursor}
                renderContainer={TreeViewContainer}
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