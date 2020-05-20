
const map = {} as {
	[key: string]: {
		recorder: MediaRecorder;
		data: BlobPart[];
		isProcessed: boolean;
	}
};

export const BeginStream = async () => {
	const stream = await (navigator.mediaDevices as any).getDisplayMedia();

	const recorderOptions = {
		mimeType: 'video/webm; codecs=vp9'
	};

	const key = new Date(Date.now()).toUTCString();

	const recorder = new MediaRecorder(stream, recorderOptions);
	recorder.addEventListener('dataavailable', dataAvailable.bind(null, key));
	recorder.addEventListener('stop', evt => {
		if (map[key]) {
			map[key].isProcessed = true;
			evt.target && evt.target.addEventListener('', () => {});
		}
	});
	recorder.start();

	map[key] = { recorder, data: [], isProcessed: false };

	return { recorder, key };
}

export const EndStream = async (key: string) => {
	const item = map[key];

	if (!item)
		return null;

	item.recorder.stop();

	await new Promise((resolve) => {
		setTimeout(resolve, 0);
	})

	const blob = new Blob(item.data, {
		type: 'video/webm'
	});


	delete map[key];
	return blob;
}

export const SaveStream = async (data: Blob) => {
	if (navigator.msSaveBlob) {
		navigator.msSaveBlob(data, 'file.webm');
	} else {
		const url = URL.createObjectURL(data);

		const anchor = document.createElement('a');
		anchor.style.display = 'none';
		anchor.download = 'file.webm';
		anchor.href = url;

		document.body.appendChild(anchor);

		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(url);
	}
}

function dataAvailable(key: string, event: BlobEvent) {
	if (event.data.size > 0) {
		const buffer = map[key].data;
		buffer.push(event.data);
	}
}