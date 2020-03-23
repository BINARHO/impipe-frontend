import React from 'react';
import { produce } from 'immer';
import * as go from 'gojs';
import * as uuid from 'uuid'

import { Toolbox } from './components/Toolbox';
import { Inspector } from './components/Inspector';
import { Console } from './components/Console';
import { Graph } from './components/Diagram';

const { ipcRenderer } = window.require("electron");

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            console: [],
            nodeDataArray: [],
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
        this.handleComputeRequest = this.handleComputeRequest.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
    }

    componentDidMount() {
        console.log("App componentDidMount")
        if (this.state.nodeDataArray.length === 0) {
            let compute_type = {
                name: "Compute",
                type: "ComputeNode",
                inputs: ["in"],
                outputs: [], 
                props: {}
            }
            this.handleAddNode(compute_type)
        }
    }

    zrpcRecv(event, data) {
        console.log(data)
        this.setState(
            produce((draft_state) => {
                draft_state.console.push(
                    {
                        "date": new Date(),
                        "data": data,
                    }
                )
            })
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

        ipcRenderer.send("zrpc-update", obj)

        console.log(obj)

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

    handleAddNode(type) {
        let newNode = { key: uuid.v4(), loc: "0 0", ...type }
        this.setState(
            produce((draft_state) => {
                draft_state.nodeDataArray.push(newNode)
                this.refreshNodeIndex(draft_state.nodeDataArray)
            })
        )
        let events = {
            'insertedNodeKeys': [newNode.key],
            'modifiedNodeData': [newNode]
        }
        this.handleModelChange(events)
    }

    handleComputeRequest() {
        const event = {
            "selectedData": this.state.selectedData.key
        }
        ipcRenderer.send("zrpc-compute", event)
    }

    /**
     * Handle inspector changes, and on input field blurs, update node/link data state.
     * @param path the path to the property being modified
     * @param value the new value of that property
     * @param isBlur whether the input event was a blur, indicating the edit is complete
     */
    handleInputChange(path, value, isBlur) {
        this.setState(
            produce((draft_state) => {
                const data = draft_state.selectedData
                if (path in data) {
                    data[path] = value;
                } else if (path in data.props) {
                    data.props[path] = value
                } else {
                    throw new Error("wierd path: " + path)
                }
                if (isBlur) {
                    const key = data.key;
                    if (key < 0) {  // negative keys are links
                        const idx = this.mapLinkKeyIdx.get(key);
                        if (idx !== undefined && idx >= 0) {
                            draft_state.linkDataArray[idx] = data;
                            draft_state.skipsDiagramUpdate = false;
                        }
                    } else {
                        const idx = this.mapNodeKeyIdx.get(key);
                        if (idx !== undefined && idx >= 0) {
                            draft_state.nodeDataArray[idx] = data;
                            draft_state.skipsDiagramUpdate = false;
                        }
                    }
                }
            })
        );
        if (isBlur) {
            const data = this.state.selectedData
            let events = {
                'modifiedNodeData': [data]
            }
            this.handleModelChange(events)
        }
    }

    render() {
        return (
            <div className="app antialiased h-screen flex flex-col bg-apple-500 text-apple-100">
                <div className="w-screen">
                    <Toolbox 
                        onToolAdd={this.handleAddNode}
                        onCompute={this.handleComputeRequest}
                    />
                </div>
                <div className="main h-full flex flex-row">
                    <div className="graph bg-apple-600 w-3/4 shadow-inner shadow-xl">
                        <Graph 
                            nodeDataArray={this.state.nodeDataArray}
                            linkDataArray={this.state.linkDataArray}
                            modelData={this.state.modelData}
                            skipsDiagramUpdate={this.state.skipsDiagramUpdate}
                            onDiagramEvent={this.handleGraphChange}
                            onModelChange={this.handleModelChange}
                        />
                    </div>
                    <div className="inspector w-1/4 px-4 py-2 border-l-2 border-apple-400">
                        <div className="h-1/2 overflow-auto">
                            <Inspector 
                                selectedData={this.state.selectedData}
                                onInputChange={this.handleInputChange}
                                onCompute={this.handleComputeRequest}
                            />
                        </div>
                        <div className="relative h-1/2">
                            <Console console={this.state.console} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default App;