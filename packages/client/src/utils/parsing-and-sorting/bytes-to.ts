export const bytesTo = {
	b: (bytes: number) => bytes * 8,
	KB: (bytes: number) => bytes / 1024,
	kb: (bytes: number) => (bytes * 8) / 1024,
	MB: (bytes: number) => bytes / 1024 ** 2,
	mb: (bytes: number) => (bytes * 8) / 1024 ** 2,
	GB: (bytes: number) => bytes / 1024 ** 3,
	gb: (bytes: number) => (bytes * 8) / 1024 ** 3,
	TB: (bytes: number) => bytes / 1024 ** 4,
	tb: (bytes: number) => (bytes * 8) / 1024 ** 4,
};

export const formatBytes = (bytes: number) => {
	if (bytes < 1024) {
		return `${bytes} bytes`;
	}
	if (bytes < 1024 ** 2) {
		return `${bytesTo.KB(bytes).toFixed(2)} KB`;
	}
	if (bytes < 1024 ** 3) {
		return `${bytesTo.MB(bytes).toFixed(2)} MB`;
	}
	if (bytes < 1024 ** 4) {
		return `${bytesTo.GB(bytes).toFixed(2)} GB`;
	}
	return `${bytesTo.TB(bytes).toFixed(2)} TB`;
};
