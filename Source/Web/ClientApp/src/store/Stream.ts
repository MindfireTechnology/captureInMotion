import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import { BeginStream, EndStream, SaveStream } from '../services/StreamService';

export interface StreamState {
	isStreaming: boolean;
	stream?: MediaStream;
	streamKey?: string;
}

const BEGINSTREAM = 'Stream/Begin';
const ENDSTREAM = 'Stream/End';

interface BeginStreamAction {
	type: typeof BEGINSTREAM;
	stream: MediaStream;
	streamKey: string;
}
interface EndStreamAction {
	type: typeof ENDSTREAM;
}

type KnownAction = BeginStreamAction | EndStreamAction;

export const actionCreators = {
	beginStream: (): AppThunkAction<KnownAction> => async (dispatch) => {
		const result = await BeginStream();

		dispatch({
			type: BEGINSTREAM,
			stream: result.recorder.stream,
			streamKey: result.key
		});
	},
	endStream: (): AppThunkAction<KnownAction> => async (dispatch, getState) => {
		const streamState = getState().stream;
		if(streamState) {
			const data = await EndStream(streamState.streamKey as string);

			if (data) {
				await SaveStream(data);
			}
		}

		dispatch({
			type: ENDSTREAM
		});
	}
};

const defaultState: StreamState = {
	isStreaming: false
};

export const reducer: Reducer<StreamState> = (state: StreamState | undefined, incomingAction: Action): StreamState => {
	if (state === undefined) {
		return defaultState;
	}

	const action = incomingAction as KnownAction;
	switch(action.type) {
		case BEGINSTREAM:
			return {
				...state,
				isStreaming: true,
				stream: action.stream,
				streamKey: action.streamKey
			};
		case ENDSTREAM:
			return {
				...state,
				isStreaming: false,
				stream: undefined,
				streamKey: undefined
			};
	}

	return state;
}
