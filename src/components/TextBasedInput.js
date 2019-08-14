import React, {Component} from 'react';
import PropTypes from 'prop-types';
import '../root.css';

/**
 * Text based user input with validation.
 * @author Michael Galliers (KYDronePilot)
 */
class TextBasedInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valid: true
        };
    }

    static propTypes = {
        label: PropTypes.string,
        inputType: PropTypes.string,
        handleChange: PropTypes.func,
        defaultValue: PropTypes.any
    };

    /**
     * Check if value is an integer.
     * @param value {string} - Value to check
     * @return {boolean} Whether the value in an integer or not
     */
    static isInt(value) {
        return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
    }

    /**
     * Validate input from user matches input type.
     * @param value {string} - Input to validate
     * @return {boolean} Whether or not the input is valid
     */
    validateInput(value) {
        if (this.props.inputType === 'int')
            return TextBasedInput.isInt(value) && parseInt(value) > 0;
        return false;
    }

    /**
     * Handle change to the input field.
     * @param event - Event to handle
     */
    handleChange(event) {
        const val = event.target.value;
        // If blank, use default value
        if (val === '') {
            this.setState({valid: true});
            this.props.handleChange(this.props.defaultValue);
        }
        // Update states based on validity of data
        else if (this.validateInput(val)) {
            this.setState({valid: true});
            this.props.handleChange(parseInt(val));
        }
        else {
            this.setState({valid: false});
            this.props.handleChange(0);
        }
    }

    render() {
        return (
            <div style={{display: 'block'}} className={'roboto'}>
                <h4 style={{display: 'block', marginBottom: '8px'}}>
                    {this.props.label}
                </h4>
                <input
                    onChange={this.handleChange.bind(this)}
                    type={'text'}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '15px',
                        padding: '6px 8px',
                        fontSize: '14px',
                        color: '#555',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #cccccc'
                    }}
                    placeholder={this.props.defaultValue}
                />
                <small style={{
                    color: 'red',
                    display: this.state.valid ? 'none' : 'block',
                    paddingTop: '8px'
                }}
                >
                    Invalid input
                </small>
            </div>
        );
    }
}

export default TextBasedInput;