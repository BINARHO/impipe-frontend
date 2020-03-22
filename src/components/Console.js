import React from 'react'

export class Console extends React.Component {
    render() {
        return (
            <div className="inspector">
                <h1 className="font-bold mb-2 border-b 2 border-apple-400">Python Data:</h1>
                <p>
                    {this.props.console}
                </p>
            </div>
        )
    }
}