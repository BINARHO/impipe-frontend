import React from 'react';

import * as go from 'gojs';
import * as uuid from 'uuid'

import { ReactDiagram } from 'gojs-react';

export class Graph extends React.Component {
    constructor(props) {
        super(props)
        this.diagramRef = React.createRef();
    }

    /**
     * Get the diagram reference and add any desired diagram listeners.
     * Typically the same function will be used for each listener, with the function using a switch statement to handle the events.
     */
    componentDidMount() {
        if (!this.diagramRef.current) return;
        const diagram = this.diagramRef.current.getDiagram();
        if (diagram instanceof go.Diagram) {
            diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent)
        }
    }

    /**
     * Get the diagram reference and remove listeners that were added during mounting.
     */
    componentWillMount() {
        if (!this.diagramRef.current) return;
        const diagram = this.diagramRef.current.getDiagram();
        if (diagram instanceof go.Diagram) {
            diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent)
        }
    }

    initDiagram() {
        const $ = go.GraphObject.make;
        const diagram =
          $(go.Diagram,
            {
              'undoManager.isEnabled': true,  // must be set to allow for model change listening
              // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
              'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
              model: $(go.GraphLinksModel,
                {
                    linkKeyProperty: 'key',  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
                    linkFromPortIdProperty: "fromPort",  // required information:
                    linkToPortIdProperty: "toPort",      // identifies data property names  
    
                    // key assignment to new nodes
                    makeUniqueKeyFunction: (m, data) => {
                        let k = uuid.v4()
                        data.key = k;
                        return k;
                      },
                })
            });
    
        diagram.nodeTemplate = $(go.Node, "Auto", { name: "Node", selectionAdorned: false },
            $(go.Shape, "RoundedRectangle", { fill: "rgb(99, 99, 102)", strokeWidth: 2, spot1: new go.Spot(0, 0), spot2: new go.Spot(1, 1) },
              new go.Binding("stroke", "isSelected", (sel) => { if (sel) return "rgb(100, 210, 255)"; else return "rgb(142, 142, 147)"; }).ofObject("Node")
            ),
            $(go.Panel, "Table",
              $(go.RowColumnDefinition, { column: 0, alignment: go.Spot.Left }),
              $(go.RowColumnDefinition, { column: 2, alignment: go.Spot.Right }),
              $(go.TextBlock, 
                {
                  column: 0, row: 0, columnSpan: 3, alignment: go.Spot.Center,
                  font: "bold 10pt sans-serif", margin: new go.Margin(4, 2), stroke: "rgb(44, 44, 46)"
                },
                new go.Binding("text", "name")
              ),
              $(go.Panel, "Vertical", { column: 0, row: 1 },
                new go.Binding("itemArray", "inputs"),
                {
                  itemTemplate:
                    $(go.Panel, "Horizontal",
                      $(go.Shape, new go.Binding("portId", ""), { width: 6, height: 6, portId: "In", toSpot: go.Spot.Left, toLinkable: true, toMaxLinks: 1, fill: "rgb(142, 142, 147)", strokeWidth: 0 }),
                      $(go.TextBlock, new go.Binding("text", ""), { stroke: "rgb(44, 44, 46)" }),
                    )
                }
              ),
              $(go.Panel, "Vertical", { column: 3, row: 1 },
                new go.Binding("itemArray", "outputs"),
                {
                  itemTemplate:
                    $(go.Panel, "Horizontal",
                      $(go.TextBlock, new go.Binding("text", ""), { stroke: "rgb(44, 44, 46)" }),
                      $(go.Shape, new go.Binding("portId", ""), { width: 6, height: 6, toSpot: go.Spot.Right, fromLinkable: true, fill: "rgb(142, 142, 147)", strokeWidth: 0 }),
                    )
                }
              ),
            ),
        )
    
        diagram.linkTemplate = $(go.Link, { selectionAdorned: false, relinkableFrom: true, relinkableTo: true },
          $(go.Shape, { strokeWidth: 2 },
            new go.Binding("fill", "isSelected", (sel) => { if (sel) return "rgb(100, 210, 255)"; else return "rgb(142, 142, 147)"; }).ofObject(""),
            new go.Binding("stroke", "isSelected", (sel) => { if (sel) return "rgb(100, 210, 255)"; else return "rgb(142, 142, 147)"; }).ofObject(""),
          ),
          $(go.Shape, { toArrow: "Standard" },
            new go.Binding("fill", "isSelected", (sel) => { if (sel) return "rgb(100, 210, 255)"; else return "rgb(142, 142, 147)"; }).ofObject(""),
            new go.Binding("stroke", "isSelected", (sel) => { if (sel) return "rgb(100, 210, 255)"; else return "rgb(142, 142, 147)"; }).ofObject(""),
          )
        )
    
        // snap to grid
        diagram.toolManager.draggingTool.isGridSnapEnabled = true;
    
        // disable initial animation
        diagram.animationManager.initialAnimationStyle = go.AnimationManager.None
    
        return diagram;
    }

    render() {
        return (
                <ReactDiagram
                    ref={this.diagramRef}
                    initDiagram={this.initDiagram}
                    divClassName='w-full h-full'
                    nodeDataArray={this.props.nodeDataArray}
                    linkDataArray={this.props.linkDataArray}
                    onModelChange={this.props.onModelChange}
                />
        )
    }
}
