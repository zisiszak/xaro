import 'exitus';

declare module 'exitus' {
	export interface LogConfig {
		error: (data: any) => void;
		info: (data: any) => void;
		warn: (data: any) => void;
		debug: (data: any) => void;
		fatal: (data: any) => void;
	}
}
