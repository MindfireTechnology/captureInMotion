import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as StreamStore from '../../store/Stream';
import { Stream } from './Stream';

export default connect(
	(state: ApplicationState) => state.stream,
	StreamStore.actionCreators
)(Stream as any);