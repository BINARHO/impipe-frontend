import React from 'react';
import { produce } from 'immer';
import * as go from 'gojs';

import { Graph } from './Diagram';

import './App.css';

const { ipcRenderer } = window.require("electron");

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            console: "None",
            nodeDataArray: [
                { 
                  key: 0, title: 'Alpha', loc: '0 0', 
                  inputs: [ "a", "b" ],
                  outputs: [ "x" ] 
                },
                { 
                  key: 1, title: 'Beta', loc: '150 0',
                  inputs: [ "a" ],
                  outputs: [ "x", "y" ] 
                },
                { 
                  key: 2, title: 'Gamma', loc: '0 150',
                  inputs: [ "a", "b" ],
                  outputs: [ "x" ] 
                },
                { 
                  key: 3, title: 'Delta', loc: '150 150',
                  inputs: [ "a" ],
                  outputs: [ "x", "y", "z" ] 
                },
            ],
            linkDataArray: [],
            modelData: {
                canRelink: true
            },
            selectedData: null,
            skipsDiagramUpdate: false
        }

        // init maps
        this.mapNodeKeyIdx = new Map()
        this.mapLinkKeyIdx = new Map()
        this.refreshNodeIndex(this.state.nodeDataArray)
        this.refreshLinkIndex(this.state.linkDataArray)

        // register ipc events
        ipcRenderer.on('zrpc-recv', this.zrpcRecv.bind(this))

        // bind handlers
        this.handleGraphChange = this.handleGraphChange.bind(this)
        this.handleModelChange = this.handleModelChange.bind(this)
        this.handleAddNode = this.handleAddNode.bind(this)
    }

    zrpcRecv(event, data) {
        console.log(data)
        this.setState(
            produce((draft_state) => {draft_state.console = data})
        )
    }

    refreshNodeIndex(nodeArray) {
        this.mapNodeKeyIdx.clear()
        nodeArray.forEach((node, idx) => {
            this.mapNodeKeyIdx.set(node.key, idx)
        });
    }

    refreshLinkIndex(linkArray) {
        this.mapLinkKeyIdx.clear()
        linkArray.forEach((link, idx) => {
            this.mapLinkKeyIdx.set(link.key, idx)
        });
    }

    handleGraphChange(event) {
        const name = event.name
        switch (name) {
            case "ChangedSelection": {
                this.handleGraphSelectionChange(event)
                break
            }
            default: break
        }
    }

    handleGraphSelectionChange(event) {
        const selection = event.subject.first()
        this.setState(
            produce((draft_state) => {
                if (selection) {
                    if (selection instanceof go.Node) {
                        const idx = this.mapNodeKeyIdx.get(selection.key)
                        if (idx !== undefined && idx >= 0) {
                            const node = draft_state.nodeDataArray[idx]
                            draft_state.selectedData = node
                        }
                    } else if (selection instanceof go.Link) {
                        const idx = this.mapLinkKeyIdx.get(selection.key)
                        if (idx !== undefined && idx >= 0) {
                            const link = draft_state.linkDataArray[idx]
                            draft_state.selectedData = link
                        }
                    }
                } else {
                    draft_state.selectedData = null
                }
            })
        )
    }

    handleModelChange(obj) {
        const insertedNodeKeys = obj.insertedNodeKeys;
        const modifiedNodeData = obj.modifiedNodeData;
        const removedNodeKeys = obj.removedNodeKeys;
        const insertedLinkKeys = obj.insertedLinkKeys;
        const modifiedLinkData = obj.modifiedLinkData;
        const removedLinkKeys = obj.removedLinkKeys;
        const modifiedModelData = obj.modelData;

        // maintain maps of modified data so insertions don't need slow lookups
        const modifiedNodeMap = new Map();
        const modifiedLinkMap = new Map();

        ipcRenderer.send("zrpc-send", obj)

        this.setState(
            produce((draft) => {
            let narr = draft.nodeDataArray;
            if (modifiedNodeData) {
                console.log("handleModelChange -> modifiedNodeData")
                modifiedNodeData.forEach((nd) => {
                modifiedNodeMap.set(nd.key, nd);
                const idx = this.mapNodeKeyIdx.get(nd.key);
                if (idx !== undefined && idx >= 0) {
                    narr[idx] = nd;
                    if (draft.selectedData && draft.selectedData.key === nd.key) {
                    draft.selectedData = nd;
                    }
                }
                });
            }
            if (insertedNodeKeys) {
                console.log("handleModelChange -> insertedNodeKeys")
                insertedNodeKeys.forEach((key) => {
                const nd = modifiedNodeMap.get(key);
                const idx = this.mapNodeKeyIdx.get(key);
                if (nd && idx === undefined) {
                    this.mapNodeKeyIdx.set(nd.key, narr.length);
                    narr.push(nd);
                }
                });
            }
            if (removedNodeKeys) {
                console.log("handleModelChange -> removedNodeKeys")
                narr = narr.filter((nd) => {
                if (removedNodeKeys.includes(nd.key)) {
                    return false;
                }
                return true;
                });
                draft.nodeDataArray = narr;
                this.refreshNodeIndex(narr);
            }

            let larr = draft.linkDataArray;
            if (modifiedLinkData) {
                console.log("handleModelChange -> modifiedLinkData")
                modifiedLinkData.forEach((ld) => {
                modifiedLinkMap.set(ld.key, ld);
                const idx = this.mapLinkKeyIdx.get(ld.key);
                if (idx !== undefined && idx >= 0) {
                    larr[idx] = ld;
                    if (draft.selectedData && draft.selectedData.key === ld.key) {
                    draft.selectedData = ld;
                    }
                }
                });
            }
            if (insertedLinkKeys) {
                console.log("handleModelChange -> insertedLinkKeys")
                insertedLinkKeys.forEach((key) => {
                const ld = modifiedLinkMap.get(key);
                const idx = this.mapLinkKeyIdx.get(key);
                if (ld && idx === undefined) {
                    this.mapLinkKeyIdx.set(ld.key, larr.length);
                    larr.push(ld);
                }
                });
            }
            if (removedLinkKeys) {
                console.log("handleModelChange -> removedLinkKeys")
                larr = larr.filter((ld) => {
                if (removedLinkKeys.includes(ld.key)) {
                    return false;
                }
                return true;
                });
                draft.linkDataArray = larr;
                this.refreshLinkIndex(larr);
            }
            // handle model data changes, for now just replacing with the supplied object
            if (modifiedModelData) {
                console.log("handleModelChange -> modifiedModelData")
                draft.modelData = modifiedModelData;
            }
            draft.skipsDiagramUpdate = true;  // the GoJS model already knows about these updates
            })
        );
    }

    handleAddNode(event) {
        this.setState(
            produce((draft_state) => {
                draft_state.nodeDataArray.push({ 
                    title: 'NEW', loc: '-100 -100', 
                    inputs: [ "a", "b" ],
                    outputs: [ "x" ] 
                  })
            })
        )
    }

    render() {
        return (
            <div className="app-component" >
                <Graph 
                    nodeDataArray={this.state.nodeDataArray}
                    linkDataArray={this.state.linkDataArray}
                    modelData={this.state.modelData}
                    skipsDiagramUpdate={this.state.skipsDiagramUpdate}
                    onDiagramEvent={this.handleGraphChange}
                    onModelChange={this.handleModelChange}
                />
                <div className="bg-blue-500" style={{color: "white"}}>
                    <h1>Python Data:</h1>
                    <h2>
                        {this.state.console}
                    </h2>
                </div>
            </div>
        )
    }
}

export default App;