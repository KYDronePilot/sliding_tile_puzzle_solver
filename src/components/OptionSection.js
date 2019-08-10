import React, {Component} from 'react';
import PropTypes from 'prop-types';
import '../root.css';

class OptionSection extends Component {
    static propTypes = {
        name: PropTypes.string
    };

    render() {
        return (
            <div style={{margin: '4px 4px'}}>
                <h3
                    className={'roboto'}
                >
                    {this.props.name}
                </h3>
                <div style={{padding: '0 5px'}}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default OptionSection;