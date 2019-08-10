import React, {Component} from 'react';
import PropTypes from 'prop-types';
import '../root.css';

/**
 * Block-styled radio selection button.
 * @author Michael Galliers (KYDronePilot)
 */
class RadioBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static propTypes = {
        id: PropTypes.string,
        value: PropTypes.string,
        description: PropTypes.string,
        checked: PropTypes.bool,
        onChange: PropTypes.func
    };

    render() {
        return (
            <div
                style={{display: 'block'}}
            >
                <label className={'roboto'}>
                    <input
                        type={'radio'}
                        id={this.props.id}
                        value={this.props.value}
                        name={this.props.id}
                        checked={this.props.checked}
                        onChange={this.props.onChange}
                    /> {this.props.description}
                </label>
            </div>
        );
    }
}

export default RadioBlock;