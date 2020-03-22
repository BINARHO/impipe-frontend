import React from 'react'

export class InspectorRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.disabledList = ["key", "inputs", "outputs", "type"]
        this.disabled = this.disabledList.includes(this.props.id)
        this.inputClass = "appearance-none px-2 rounded-md border-2 border-apple-600 placeholder-apple-200"
        if (this.disabled) {
            this.inputClass += " bg-apple-500 text-apple-200"
        } else {
            this.inputClass += " bg-apple-600"
        }
    }
    
    handleInputChange(e) {
        this.props.onInputChange(this.props.id, e.target.value, e.type === 'blur');
    }
    
    render() {
        return (
            <tr>
                <td className="pr-2 w-1/4">
                    {this.props.id}
                </td>
                <td className="w-3/4">
                    <input
                        className={this.inputClass}
                        disabled={this.disabled}
                        value={this.props.value}
                        placeholder="None"
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputChange}>
                    </input>
                </td>
            </tr>
        );
    }
}