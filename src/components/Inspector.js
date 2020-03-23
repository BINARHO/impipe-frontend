import React from 'react'

import { InspectorRow } from './InspectorRow'
import { Button, Icon } from './Toolbox'

class Table extends React.Component {
    renderObjectDetails() {
        const selObj = this.props.selectedData;
        const dets = [];
        for (const k in selObj) {
            const val = selObj[k];
            let row = null;
            if (k === "props") {
                // inline props objects
                row = (
                    <tr key={k}>
                        <td className="pr-2 w-full" colSpan={2}>
                            <Table
                                selectedData={val}
                                onInputChange={this.props.onInputChange.bind(this)}
                            />
                        </td>
                    </tr>
                )
            } else {
                row = <InspectorRow
                    key={k}
                    id={k}
                    value={val}
                    onInputChange={this.props.onInputChange}
                />;
            }
            if (k === 'key') {
                dets.unshift(row); // key always at start
            } else {
                dets.push(row);
            }
        }
        return dets;
    }

    render() {
        return (
            <table className="table-fixed w-full">
                <tbody>
                    {this.renderObjectDetails()}
                </tbody>
            </table>
        )
    }
}

export class Inspector extends React.Component {
    renderComputeButten() {
        const selObj = this.props.selectedData;
        let button = null
        if (selObj && selObj.type === "ComputeNode") {
            button = (
                <div className="w-full my-2 flex justify-center">
                    <Button onClick={this.props.onCompute} className>
                        <Icon viewBox="0 0 20 20" path="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"/>
                        <span>Compute</span>
                    </Button>
                </div>
            )
        }
        return button
    }

    render() {
        return (
            <div className="inspector">
                <h1 className="font-bold mb-2 border-b 2 border-apple-400">Inspector:</h1>
                <Table 
                    selectedData = {this.props.selectedData}
                    onInputChange = {this.props.onInputChange.bind(this)}
                />
                {this.renderComputeButten()}
            </div>
        )
    }
}