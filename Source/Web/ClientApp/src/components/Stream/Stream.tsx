import * as React from 'react';
import {
	Button
} from 'reactstrap';
import { RouteComponentProps } from 'react-router';

import * as StreamStore from '../../store/Stream';

import './Stream.css';

type StreamProps = StreamStore.StreamState
	& typeof StreamStore.actionCreators
	& RouteComponentProps<{}>;

export class Stream extends React.PureComponent<StreamProps> {
	state: {
		canStream: boolean;
	}

	constructor(props: StreamProps) {
		super(props);

		this.state = {
			canStream: !!navigator.mediaDevices.getUserMedia
		};
	}

	public render() {
		if (!this.state.canStream) {
			return (
				<section>
					<p>
						We're sorry, but your browser does not support media capture and streaming.
						Please use an updated browser to get the full functionality of this site.
					</p>
				</section>
			)
		}

		if (this.props.isStreaming) {
			const video = document.createElement('video');
			video.srcObject = this.props.stream as MediaStream;
			video.onloadedmetadata = () => {
				video.play();
			};
			video.classList.add('recorder-preview');

			let reference = React.createRef<HTMLDivElement>();

			setTimeout(() => {
				if (reference.current) {
					reference.current.appendChild(video);
				}
			}, 50);

			return (
				<section>
					<p>Recording</p>
					<div data-name="video-stream" ref={reference}></div>
					<Button color="danger" type="button" onClick={this.props.endStream}>End Stream</Button>
				</section>
			);
		}

		return (
			<section>
				<Button color="primary" type="button" onClick={() => this.props.beginStream()}>Start Streaming</Button>
			</section>
		);
	}
}