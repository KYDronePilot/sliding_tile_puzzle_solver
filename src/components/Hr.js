import React, {Component} from 'react';

class Hr extends Component {
    render() {
        return (
            <hr style={{
                display: 'block',
                border: 0,
                height: '1px',
                marginTop: '15px',
                marginBottom: '15px',
                backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))'
            }}/>
        );
    }
}

export default Hr;