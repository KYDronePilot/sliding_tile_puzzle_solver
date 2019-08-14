import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Hr extends Component {
    static propTypes = {
        color: PropTypes.string
    };

    render() {
        return (
            <hr style={{
                display: 'block',
                border: 0,
                height: '1px',
                marginTop: '15px',
                marginBottom: '15px',
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0), ${this.props.color}, rgba(0, 0, 0, 0))`
            }}/>
        );
    }
}

export default Hr;