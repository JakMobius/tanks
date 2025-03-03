import "./scene-entity-library.scss"

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tree, TreeApi } from '../react-arborist/src/index';
import { TreeViewContainer, TreeViewRow, TreeViewNode, TreeViewCursor, TreeNodeBase, TreeViewDragPreview } from "../tree-view/tree-view";

interface LibraryTreeNode extends TreeNodeBase {

}

const SceneEntityLibrary: React.FC = () => {

    const rootNode = useMemo(() => {
        let rootNode: LibraryTreeNode = {
            id: "root",
            name: "",
            children: []
        }

        let mapNode: LibraryTreeNode = {
            id: "maps",
            name: "Карта",
            children: []
        }
        rootNode.children.push(mapNode)

        let modesNode: LibraryTreeNode = {
            id: "modes",
            name: "Режимы",
            children: []
        }
        rootNode.children.push(modesNode)

        let ctf: LibraryTreeNode = {
            id: "maps/ctf",
            name: "CTF",
            children: []
        }
        modesNode.children.push(ctf)

        let dm: LibraryTreeNode = {
            id: "maps/dm",
            name: "DM",
            children: []
        }
        modesNode.children.push(dm)

        let tdm: LibraryTreeNode = {
            id: "maps/tdm",
            name: "TDM",
            children: []
        }
        modesNode.children.push(tdm)

        let race: LibraryTreeNode = {
            id: "maps/race",
            name: "RACE",
            children: []
        }
        modesNode.children.push(race)

        let spawnZonesNode: LibraryTreeNode = {
            id: "spawnZones",
            name: "Зона спавна",
            children: []
        }
        rootNode.children.push(spawnZonesNode)

        return rootNode
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
            >
                {TreeViewNode}
            </Tree> : null}
        </div>
    )
}

export default SceneEntityLibrary