import React from 'react'

export class Console extends React.Component {
    getDate() {
        const date = new Date()

        return (
            date.toLocaleString()
        )
    }

    renderConsole() {
        const consoleArray = this.props.console
        const consoleList = []
        consoleArray.forEach(entry => {
            let row = (
                <div key={entry["date"].toLocaleString()}>
                    <h2 className="font-bold text-apple-200">
                        {entry["date"].toLocaleString()}
                    </h2>
                    <p>
                        {entry["data"]}
                    </p>
                </div>
            )
            consoleList.unshift(row)
        });
        return consoleList
    }

    render() {
        return (
            <div className="inspector">
                <h1 className="font-bold mb-2 border-b 2 border-apple-400">Python Console:</h1>
                {this.renderConsole()}
            </div>
        )
    }
}