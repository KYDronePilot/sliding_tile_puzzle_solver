import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { MDBContainer, MDBInput } from "mdbreact";

const RUST_ALGORITHM = 'rust-algorithm';
const JS_ALGORITHM = 'js-algorithm';

class AlgorithmSelection extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        handleAlgorithmSelect: PropTypes.func,
        boardState: PropTypes.state,
        width: PropTypes.string
    };

    render() {
        return (
            <div className={'mx-auto'} style={{width: this.props.width}}>
                <MDBContainer>
                    <MDBInput
                        gap
                        onClick={this.props.handleAlgorithmSelect.bind(this)}
                        checked={this.props.boardState.solverAlgorithm === JS_ALGORITHM}
                        label={'Native Javascript'}
                        type={'radio'}
                        id={JS_ALGORITHM}
                        value={JS_ALGORITHM}
                    />
                    <MDBInput
                        gap
                        onClick={this.props.handleAlgorithmSelect.bind(this)}
                        checked={this.props.boardState.solverAlgorithm === RUST_ALGORITHM}
                        label={'Web Assembly Rust'}
                        type={'radio'}
                        id={RUST_ALGORITHM}
                        value={RUST_ALGORITHM}
                    />
                </MDBContainer>
            </div>
        );
    }
}

export default AlgorithmSelection;