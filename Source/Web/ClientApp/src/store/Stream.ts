import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import {
	CaptureDesktop,
	EndDesktopCapture,
	SaveDesktopCapture,
	CaptureWebcam,
	EndWebcamCapture,
	SaveWebcamCapture
} from '../services/StreamService';

export interface StreamState {
	isStreaming: boolean;
	desktopStream?: MediaStream;
	desktopStreamKey?: string;
	webcamStream?: MediaStream;
	webcamStreamKey?: string;
	errorMessage?: string;
	isMuted: boolean;
}

const BEGINDESKTOP = 'Stream/Begin';
const DESKTOPFAILED = 'Stream/DesktopFailed';
const ENDDESKTOP = 'Stream/End';
const BEGINWEBCAM = 'Stream/BeginWebcam';
const ENDWEBCAM = 'Stream/EndWebcam';
const WEBCAMFAILED = 'Stream/WebcamFailed';
const BEGINBOTH = 'Stream/CaptureBoth';
const ENDBOTH = 'Stream/EndBoth';
const MUTE = 'Stream/mute';
const UNMUTE = 'Stream/unmute';

export const actionCreators = {
	captureDesktop: (): AppThunkAction<KnownAction> => async (dispatch) => {
		try {
			const result = await CaptureDesktop();

			dispatch({
				type: BEGINDESKTOP,
				stream: result.recorder.stream,
				streamKey: result.key
			});
		} catch (err) {
			dispatch({
				type: DESKTOPFAILED,
				message: `Could not capture your desktop. ${err.message}`
			});
		}
	},
	endDesktop: (): AppThunkAction<KnownAction> => async (dispatch, getState) => {
		const streamState = getState().stream;
		if(streamState) {
			const data = await EndDesktopCapture(streamState.desktopStreamKey as string);

			if (data) {
				await SaveDesktopCapture(data);
			}
		}

		dispatch({
			type: ENDDESKTOP
		});
	},
	captureWebcam: (): AppThunkAction<KnownAction> => async (dispatch) => {
		const result = await CaptureWebcam();

		dispatch({
			type: BEGINWEBCAM,
			stream: result.recorder.stream,
			streamKey: result.key
		})
	},
	endWebcam: (): AppThunkAction<KnownAction> => async (dispatch, getState) => {
		const streamState = getState().stream;
		if (streamState) {
			const data = await EndWebcamCapture(streamState.webcamStreamKey as string);

			if (data) {
				await SaveWebcamCapture(data);
			}
		}

		dispatch({
			type: ENDWEBCAM
		});
	},
	captureBoth: (): AppThunkAction<KnownAction> => async (dispatch) => {
		let desktop, webcam;
		try {
			desktop = await CaptureDesktop();
			webcam = await CaptureWebcam();

			dispatch({
				type: BEGINBOTH,
				desktopStream: desktop.recorder.stream,
				desktopKey: desktop.key,
				webcamStream: webcam.recorder.stream,
				webcamKey: webcam.key
			});
		} catch (err) {
			if (desktop) {
				await EndDesktopCapture(desktop.key);
				dispatch({
					type: WEBCAMFAILED,
					message: `Could not capture your webcam. ${err.message}`
				});
			} else {
				dispatch({
					type: DESKTOPFAILED,
					message: `Could not capture your desktop. ${err.message}`
				});
			}
		}
	},
	endBoth: (): AppThunkAction<KnownAction> => async (dispatch, getState) => {
		const streamState = getState().stream;
		if (streamState) {
			if (streamState.webcamStream) {
				const webcam = await EndWebcamCapture(streamState.webcamStreamKey as string);

				if (webcam) {
					await SaveWebcamCapture(webcam);
				}
			}

			if (streamState.desktopStream) {
				const desktop = await EndDesktopCapture(streamState.desktopStreamKey as string);

				if (desktop) {
					await SaveDesktopCapture(desktop);
				}
			}
		}

		dispatch({
			type: ENDBOTH
		});
	},
	mute: (): AppThunkAction<KnownAction> => async (dispatch) => {

	},
	unmute: (): AppThunkAction<KnownAction> => async (dispatch, getState) => {

	}
};

const defaultState: StreamState = {
	isStreaming: false,
	isMuted: false
};

export const reducer: Reducer<StreamState> = (state: StreamState | undefined, incomingAction: Action): StreamState => {
	if (state === undefined) {
		return defaultState;
	}

	if (state.errorMessage)
		delete state.errorMessage;

	const action = incomingAction as KnownAction;
	switch(action.type) {
		case BEGINDESKTOP:
			return {
				...state,
				isStreaming: true,
				desktopStream: action.stream,
				desktopStreamKey: action.streamKey
			};
		case ENDDESKTOP:
			return {
				...state,
				isStreaming: !!state.webcamStream,
				desktopStream: undefined,
				desktopStreamKey: undefined
			};
		case BEGINWEBCAM:
			return {
				...state,
				isStreaming: true,
				webcamStream: action.stream,
				webcamStreamKey: action.streamKey
			};
		case ENDWEBCAM:
			return {
				...state,
				isStreaming: !!state.desktopStream,
				webcamStream: undefined,
				webcamStreamKey: undefined
			}
		case DESKTOPFAILED:
		case WEBCAMFAILED:
			return {
				...state,
				errorMessage: action.message
			}
		case BEGINBOTH:
			return {
				...state,
				isStreaming: true,
				desktopStream: action.desktopStream,
				desktopStreamKey: action.desktopKey,
				webcamStream: action.webcamStream,
				webcamStreamKey: action.webcamKey
			};
		case ENDBOTH:
			return {
				...state,
				isStreaming: false,
				desktopStream: undefined,
				desktopStreamKey: undefined,
				webcamStream: undefined,
				webcamStreamKey: undefined
			};
		case MUTE:
			return {
				...state,
				isMuted: true
			};
		case UNMUTE:
			return {
				...state,
				isMuted: false
			}
	}

	return state;
}

interface BeginDesktopStreamAction {
	type: typeof BEGINDESKTOP;
	stream: MediaStream;
	streamKey: string;
}
interface EndDesktopStreamAction {
	type: typeof ENDDESKTOP;
}
interface BeginWebcamAction {
	type: typeof BEGINWEBCAM;
	stream: MediaStream;
	streamKey: string;
}
interface EndWebcamAction {
	type: typeof ENDWEBCAM;
}
interface DesktopStreamFailedAction {
	type: typeof DESKTOPFAILED;
	message: string;
}
interface WebcamStreamFailedAction {
	type: typeof WEBCAMFAILED;
	message: string;
}
interface BothStreamAction {
	type: typeof BEGINBOTH;
	desktopStream: MediaStream;
	desktopKey: string;
	webcamStream: MediaStream;
	webcamKey: string;
}
interface EndBothAction {
	type: typeof ENDBOTH;
}
interface MuteAction {
	type: typeof MUTE;
}
interface UnMuteAction {
	type: typeof UNMUTE;
}

type KnownAction = BeginDesktopStreamAction | EndDesktopStreamAction | BeginWebcamAction | EndWebcamAction
	| DesktopStreamFailedAction | WebcamStreamFailedAction | BothStreamAction | EndBothAction
	| MuteAction | UnMuteAction;