import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * Simple dropdown
 */
class Dropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.defaultValue
        }
    }


    static propTypes = {
        label: PropTypes.string,
        handleChange: PropTypes.func,
        defaultValue: PropTypes.string,
        values: PropTypes.array
    };

    /**
     * Handle change to the dropdown.
     * @param event - Event to handle
     */
    handleChange(event) {
        this.setState({selected: event.target.value});
        this.props.handleChange(event.target.value);
    }

    render() {
        return (
            <div style={{display: 'block'}} className={'roboto'}>
                <h4 style={{display: 'block', marginBottom: '8px'}}>
                    {this.props.label}
                </h4>
                <select onChange={this.handleChange.bind(this)} value={this.state.selected}>
                    {this.props.values.map(value => (
                        <option value={value} key={value}>{value}</option>
                    ))}
                </select>
            </div>
        );
    }
}

export default Dropdown;