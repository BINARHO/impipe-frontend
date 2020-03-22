import React from 'react';

class Icon extends React.Component {
    iconClass = "fill-current w-4 h-4 mr-2"

    render() {
        return (
            <svg className={this.iconClass} xmlns="http://www.w3.org/2000/svg" viewBox={this.props.viewBox}>
                <path d={this.props.path}/>
            </svg>
        )
    }
}

class Button extends React.Component {
    buttonClass = "bg-apple-400 hover:bg-apple-300 font-bold px-2 py-1 mx-1 rounded inline-flex items-center border-b-2 border-apple-300"

    render() {
        return (
            <button className={this.buttonClass} onClick={this.props.onClick}>
                {this.props.children}
            </button>
        )
    }
}

export class Toolbox extends React.Component {
    constantToolType = {
        name: "Constant",
        type: "ConstantTool",
        inputs: [],
        outputs: ["out"],
        value: 0
    }
    addToolType = {
        name: "Add",
        type: "AddTool",
        inputs: ["a", "b"],
        outputs: ["sum"]
    }
    subtractToolType = {
        name: "Subtruct",
        type: "SubtractTool",
        inputs: ["a", "b"],
        outputs: ["sub"]
    }
    multiplyToolType = {
        name: "Multiply",
        type: "MultiplyTool",
        inputs: ["a", "b"],
        outputs: ["mul"]
    }

    constructor(props) {
        super(props)
        this.addConstNode = this.props.onToolAdd.bind(this, this.constantToolType)
        this.addAddNode = this.props.onToolAdd.bind(this, this.addToolType)
        this.addSubNode = this.props.onToolAdd.bind(this, this.subtractToolType)
        this.addMulNode = this.props.onToolAdd.bind(this, this.multiplyToolType)

    }
    render() {
        return (
            <div className="toolbox px-4 py-2 border-b-2 border-apple-400">
                {/* <Button>
                    <Icon viewBox="0 0 20 20" path="M0 4c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z"/>
                    <span>Load</span>
                </Button>
                <Button>
                    <Icon viewBox="0 0 20 20" path="M0 2C0 .9.9 0 2 0h14l4 4v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm5 0v6h10V2H5zm6 1h3v4h-3V3z"/>
                    <span>Save</span>
                </Button> */}
                <Button onClick={this.addConstNode}>
                    <Icon viewBox="0 0 20 20" path="M20 14v4a2 2 0 0 1-2 2h-4v-2a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2H6a2 2 0 0 1-2-2v-4H2a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2V6c0-1.1.9-2 2-2h4V2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v4h-2a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2z"/>
                    <span>Constant</span>
                </Button>
                <Button onClick={this.addAddNode}>
                    <Icon viewBox="0 0 20 20" path="M11 9V5H9v4H5v2h4v4h2v-4h4V9h-4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/>
                    <span>Add</span>
                </Button>
                <Button onClick={this.addSubNode}>
                    <Icon viewBox="0 0 20 20" path="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm5-11H5v2h10V9z"/>
                    <span>Subtract</span>
                </Button>
                <Button onClick={this.addMulNode}>
                    <Icon viewBox="0 0 20 20" path="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83-1.41-1.41L10 8.59 7.17 5.76 5.76 7.17 8.59 10l-2.83 2.83 1.41 1.41L10 11.41l2.83 2.83 1.41-1.41L11.41 10z"/>
                    <span>Multiply</span>
                </Button>
                <Button>
                    <Icon viewBox="0 0 20 20" path="M17 12h-6v4h1v4H8v-4h1v-4H3v4h1v4H0v-4h1v-4a2 2 0 0 1 2-2h6V6H7V0h6v6h-2v4h6a2 2 0 0 1 2 2v4h1v4h-4v-4h1v-4z"/>
                    <span>Compute</span>
                </Button>

                {/* <div className="tools-dropdown inline-block">
                    <button className={this.buttonClass}>
                        <svg className={this.iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M10 1l10 6-10 6L0 7l10-6zm6.67 10L20 13l-10 6-10-6 3.33-2L10 15l6.67-4z"/>
                        </svg>
                        <span>New Node</span>
                    </button>
                    <div className="absolute w-24 bg-apple-300">
                        <a className="block hover:bg-apple-600" href="#">tool a</a>
                        <a className="block hover:bg-apple-600" href="#">tool b</a>
                        <a className="block hover:bg-apple-600" href="#">tool c</a>
                    </div>
                </div> */}
             </div>
        )
    }
}