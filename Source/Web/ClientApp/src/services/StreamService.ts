
const map = {} as {
	[key: string]: {
		recorder: MediaRecorder;
		data: BlobPart[];
		isProcessed: boolean;
	}
};

export const CaptureDesktop = async () => {
	const stream = await (navigator.mediaDevices as any).getDisplayMedia();
	return Capture(stream, desktopDataAvailable);
}

export const EndDesktopCapture = async (key: string) => {
	const result = await EndCapture(key);
	// (navigator.mediaDevices as any).getDisplayMedia
	return result;
}

export const SaveDesktopCapture = async (data: Blob) => {
	return Save(data, 'desktop.webm');
}

export const CaptureWebcam = async () => {
	const webCamConfig: MediaStreamConstraints = {
		audio: true,
		video: true
	};

	const stream = await navigator.mediaDevices.getUserMedia(webCamConfig);

	return Capture(stream, webcamDataAvailable);
}

export const EndWebcamCapture = async (key: string) => {
	return await EndCapture(key);
}

export const SaveWebcamCapture = async (data: Blob) => {
	return Save(data, 'webcam.webm');
}

export const ToggleMicrophone = (key: string) => {
	const item = map[key];

	if (!item)
		throw new Error('Stream could not be found');

	item.recorder.stream.getAudioTracks().forEach(at => at.stop());
}

function Capture(stream: MediaStream, onDataAvailable: (key: string, event: BlobEvent) => void) {
	const recorderOptions = {
		mimeType: 'video/webm; codecs=vp9'
	};

	const key = new Date(Date.now()).toUTCString();

	const recorder = new MediaRecorder(stream, recorderOptions);
	recorder.addEventListener('dataavailable', onDataAvailable.bind(null, key));
	recorder.addEventListener('stop', evt => {
		if (map[key]) {
			map[key].isProcessed = true;
		}
	});

	recorder.start();
	map[key] = { recorder, data: [], isProcessed: false };
	return { recorder, key };
}

async function EndCapture(key: string) {
	const item = map[key];

	if (!item)
		return null;

	item.recorder.stop();
	const tracks = item.recorder.stream.getTracks();
	tracks.forEach(t => {
		if (t.enabled) {
			t.stop();
		}
	});


	await new Promise((resolve) => {
		setTimeout(resolve, 0);
	});

	const blob = new Blob(item.data, {
		type: 'video/webm'
	});

	delete map[key];
	return blob;
}

function Save(data: Blob, name: string) {
	if (navigator.msSaveBlob) {
		navigator.msSaveBlob(data, name);
	} else {
		const url = URL.createObjectURL(data);

		const anchor = document.createElement('a');
		anchor.style.display = 'none';
		anchor.download = name;
		anchor.href = url;

		document.body.appendChild(anchor);

		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(url);
	}
}

function desktopDataAvailable(key: string, event: BlobEvent) {
	if (event.data.size > 0) {
		const buffer = map[key].data;
		buffer.push(event.data);
	}
}

function webcamDataAvailable(key: string, event: BlobEvent) {
	if (event.data.size > 0) {
		const buffer = map[key].data;
		buffer.push(event.data);
	}
}
