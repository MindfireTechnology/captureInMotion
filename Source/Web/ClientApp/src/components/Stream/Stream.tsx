import * as React from 'react';
import {
	Button, Alert
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

	protected CaptureBoth = () => {
		this.props.captureBoth();
	}

	protected ErrorMessage = () => {
		if (this.props.errorMessage) {
			return (<Alert color="danger">{this.props.errorMessage}</Alert>)
		}

		return null;
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
			const desktopReference = React.createRef<HTMLDivElement>();
			const webcamReference = React.createRef<HTMLDivElement>();

			if (this.props.desktopStream) {
				const video = document.createElement('video');
				video.srcObject = this.props.desktopStream as MediaStream;
				video.onloadedmetadata = () => {
					video.play();
				};
				video.classList.add('w-100');


				setTimeout(() => {
					if (desktopReference.current) {
						desktopReference.current.appendChild(video);
					}
				}, 50);
			}

			if (this.props.webcamStream) {
				const video = document.createElement('video');
				video.srcObject = this.props.webcamStream as MediaStream;
				video.onloadedmetadata = () => {
					video.play();
				};
				video.classList.add('w-100');


				setTimeout(() => {
					if (webcamReference.current) {
						webcamReference.current.appendChild(video);
					}
				}, 50);
			}

			return (
				<section className="d-flex flex-wrap">
					{this.ErrorMessage()}
					<div className="col-12">
						<h1>Recording</h1>
					</div>
					{this.props.desktopStream && <div className="col">
						<h3>Desktop</h3>
						<div data-name="video-stream" ref={desktopReference}></div>
						{!this.props.webcamStream && <Button color="danger" type="button" onClick={this.props.endDesktop}>End Desktop</Button>}
					</div>}
					{this.props.webcamStream && <div className="col">
						<h3>Webcam</h3>
						<div data-name="webcam-stream" ref={webcamReference}></div>
						{/* Work in progress {this.props.isMuted
							? <Button color="info" type="button" onClick={this.props.unmute}>Unmute</Button>
							: <Button color="warning" type="button" onClick={this.props.mute}>Mute</Button>
						} */}
						{!this.props.desktopStream && <Button color="danger" type="button" onClick={this.props.endWebcam}>End Webcam</Button>}
					</div>}
					{this.props.webcamStream && this.props.desktopStream &&
						<div className="col-12">
							<Button color="warning" onClick={this.props.endBoth}>End</Button>
						</div>}
				</section>
			);
		}

		return (
			<section>
				{this.ErrorMessage()}
				<Button color="primary" type="button" onClick={() => this.props.captureDesktop()}>Capture Desktop Only</Button>
				<Button color="info" type="button" onClick={() => this.props.captureWebcam()}>Capture Webcam Only</Button>
				<Button color="secondary" type="button" onClick={this.CaptureBoth}>Capture Webcam and Desktop</Button>
			</section>
		);
	}
}