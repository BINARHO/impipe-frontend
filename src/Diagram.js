import React from 'react';

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';

import './Diagram.css'

function initDiagram() {
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
              makeUniqueKeyFunction: (model, data) => {
                let k = data.key || 1;
                while (model.findNodeDataForKey(k)) k++;
                data.key = 'n' + k;
                return 'n' + k;
              },

              // key assignment to new links
              makeUniqueLinkKeyFunction: (model, data) => {
                let k = data.key || 1;
                while (model.findLinkDataForKey(k)) k++;
                data.key = 'l' + k;
                return 'l' + k;
              }
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
            new go.Binding("text", "title")
          ),
          $(go.Panel, "Vertical", { column: 0, row: 1 },
            new go.Binding("itemArray", "inputs"),
            {
              itemTemplate:
                $(go.Panel, "Horizontal",
                  $(go.Shape, { width: 6, height: 6, portId: "In", toSpot: go.Spot.Left, toLinkable: true, fill: "rgb(142, 142, 147)", strokeWidth: 0 }),
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
                  $(go.Shape, { width: 6, height: 6, portId: "Out", toSpot: go.Spot.Right, fromLinkable: true, fill: "rgb(142, 142, 147)", strokeWidth: 0 }),
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

function handleModelChange(changes) {
    // alert('GoJS model changed!');
}

export class Graph extends React.Component {
    render() {
        return (
            <div className="graph">
                <ReactDiagram
                    initDiagram={initDiagram}
                    divClassName='diagram-component'
                    nodeDataArray={this.props.nodeDataArray}
                    linkDataArray={this.props.linkDataArray}
                    onModelChange={this.props.onModelChange}
                />
            </div>
        )
    }
}
