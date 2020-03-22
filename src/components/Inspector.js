import React from 'react'

import { InspectorRow } from './InspectorRow'

export class Inspector extends React.Component {
    renderObjectDetails() {
        const selObj = this.props.selectedData;
        const dets = [];
        for (const k in selObj) {
          const val = selObj[k];
          const row = <InspectorRow
                        key={k}
                        id={k}
                        value={val}
                        onInputChange={this.props.onInputChange} />;
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
            <div className="inspector">
                <h1 className="font-bold mb-2 border-b 2 border-apple-400">Inspector:</h1>
                <table className="table-fixed w-full">
                    <tbody>
                        {this.renderObjectDetails()}
                    </tbody>
                </table>
            </div>
        )
    }
}