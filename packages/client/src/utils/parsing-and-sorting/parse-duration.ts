export interface Duration {
	hours: number;
	minutes: number;
	seconds: number;
	duration: number;
	toString(): string;
}

export const parseDuration = (durationInSeconds: unknown): Duration | null => {
	const duration =
		typeof durationInSeconds === 'number'
			? durationInSeconds
			: typeof durationInSeconds === 'string'
				? parseFloat(durationInSeconds)
				: null;
	if (duration === null) {
		return null;
	}

	if (
		isNaN(duration) === true ||
		isFinite(duration) === false ||
		duration < 0
	) {
		console.error({
			message: 'Invalid duration provided.',
			durationProvided: durationInSeconds,
			parsedDuration: duration,
		});
		return null;
	}

	let hours = Math.floor(duration / 3600);
	const hrsAsSeconds = hours * 3600;
	let minutes = Math.floor((duration - hrsAsSeconds) / 60);
	let seconds =
		Math.round((duration - minutes * 60 - hrsAsSeconds) * 10000) / 10000;

	if (seconds >= 60) {
		minutes++;
		seconds = 0;
	}
	if (minutes === 60) {
		hours++;
		minutes = 0;
	}

	return {
		hours: hours,
		minutes: minutes,
		seconds: seconds,
		duration: duration,
		toString() {
			let h = this.hours;
			let m = this.minutes;
			let s = this.seconds;
			if (s >= 59.5) {
				m++;
				s = 0;
				if (m === 60) {
					h++;
					m = 0;
				}
			}

			return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${Math.round(s).toString().padStart(2, '0')}`;
		},
	};
};
