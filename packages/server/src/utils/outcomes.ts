/* eslint-disable @typescript-eslint/ban-types */
// OUTCOMES

import { type Dirent, type PathLike } from 'fs';
import { ObjectPropertyPath } from './types-and-guards/index.js';

export const _errorOutcomeSym: unique symbol = Symbol('OUTCOME:ERROR');
export type _errorOutcomeSym = typeof _errorOutcomeSym;

export const _successOutcomeSym: unique symbol = Symbol('OUTCOME:SUCCESS');
export type _successOutcomeSym = typeof _successOutcomeSym;

export type AnyOutcomeSym = _errorOutcomeSym | _successOutcomeSym;

// ERRORS

/** Similar to an `UNKNOWN_ERROR`, except that this type of error should only be used in contexts where an exception should not arise and is not ever expected to in the execution context, yet does. Ideally used for debugging, since this indicates an implementation problem. */
export const UNEXPECTED_ERROR: unique symbol = Symbol('ERROR:UNEXPECTED');
export type UNEXPECTED_ERROR = typeof UNEXPECTED_ERROR;

export const UNKNOWN_ERROR: unique symbol = Symbol('ERROR:UNKNOWN');
export type UNKNOWN_ERROR = typeof UNKNOWN_ERROR;

export const GENERIC_ERROR: unique symbol = Symbol('ERROR:GENERIC');
export type GENERIC_ERROR = typeof GENERIC_ERROR;

export const FS_ERROR: unique symbol = Symbol('ERROR:FS');
export type FS_ERROR = typeof FS_ERROR;

export const PARAMS_ERROR: unique symbol = Symbol('ERROR:PARAMS');
export type PARAMS_ERROR = typeof PARAMS_ERROR;

export type PresetErrorKind =
	| UNEXPECTED_ERROR
	| UNKNOWN_ERROR
	| GENERIC_ERROR
	| FS_ERROR
	| PARAMS_ERROR;

export type ErrorKind = PresetErrorKind | string | number | symbol;

export const ERROR = {
	UNEXPECTED: UNEXPECTED_ERROR,
	UNKNOWN: UNKNOWN_ERROR,
	GENERIC: GENERIC_ERROR,
	FS: FS_ERROR,
	PARAMS: PARAMS_ERROR,
} as const;

// PAYLOADS
export type ErrorOutcome<Kind extends ErrorKind = GENERIC_ERROR> = {
	readonly [_errorOutcomeSym]: Kind;
	stack: string | null;
	caughtException?: unknown;
	message?: string;
	context?: Record<string, unknown>;
};

export type GenericError = ErrorOutcome<GENERIC_ERROR>;
export type UnexpectedError = ErrorOutcome<UNEXPECTED_ERROR>;
export type UnknownError = ErrorOutcome<UNKNOWN_ERROR>;
export type FsError = ErrorOutcome<FS_ERROR> & {
	files?: Dirent[] | PathLike[] | Dirent | PathLike;
};
export type ParamsError<T = unknown> = ErrorOutcome<PARAMS_ERROR> & {
	paramsData?: {
		reason?: 'INVALID_SYNTAX' | 'INVALID_TYPE';
		propertyPath: T extends Record<string, unknown>
			? ObjectPropertyPath<'arg0', T>
			: string;
	}[];
};

export type PresetError =
	| GenericError
	| UnexpectedError
	| UnknownError
	| FsError
	| ParamsError;

export type MappedError<Kind extends ErrorKind> = Kind extends PresetErrorKind
	? Extract<PresetError, { [_errorOutcomeSym]: Kind }>
	: ErrorOutcome<Kind>;

// because typescript hates me
type MapPayloadProps<Obj> = {
	[Key in keyof Obj as Key extends 'stack' | _errorOutcomeSym
		? never
		: Key]: Obj[Key];
};

export interface ErrorPayloadOptions {
	/**
	 * Toggles whether to include the stack trace (trimmed to exclude the ErrorOutcome call)
	 * @default true
	 */
	stack?: boolean;
}

export type LoggerFunction = (data: object | string, message?: string) => void;

/** Creates a generic `ErrorOutcome`.
 *
 * @param payload - The data to include in the wrapped `ErrorOutcome`, in the form of an object.
 * @param options - Adjust additional options.
 *
 * @returns An `ErrorOutcome` object of the `GENERIC_ERROR` kind.
 */
export function errorOutcome<CustomProps extends Readonly<object> = {}>(
	payload?: MapPayloadProps<MappedError<GENERIC_ERROR>> &
		MapPayloadProps<CustomProps>,
	options?: ErrorPayloadOptions,
): MappedError<GENERIC_ERROR> & CustomProps;

/** Creates a generic `ErrorOutcome`, and logs the outcome using the provided logger function
 *
 * @param payload - The data to include in the wrapped `ErrorOutcome`, in the form of an object.
 * @param options - Adjust additional options.
 *
 * @returns An `ErrorOutcome` object of the `GENERIC_ERROR` kind.
 */
export function errorOutcome<CustomProps extends Readonly<object> = {}>(
	payload?: MapPayloadProps<MappedError<GENERIC_ERROR>> &
		MapPayloadProps<CustomProps>,
	logger?: LoggerFunction,
	options?: ErrorPayloadOptions,
): MappedError<GENERIC_ERROR> & CustomProps;

/**
 * Creates a custom `ErrorOutcome` - a typed error wrapper.
 *
 * @param kind - An {@link ErrorKind} to use for the error outcome. Can be a `PresetErrorKind`, a `string`, `number`, or `symbol`.
 * @param payload - The data to include in the wrapped `ErrorOutcome`, in the form of an object.
 * @param options - Adjust additional options.
 *
 * @returns An `ErrorOutcome` object of the kind matching the `kind` parameter.
 */
export function errorOutcome<
	Kind extends ErrorKind,
	CustomProps extends Readonly<object> = {},
>(
	kind: Kind,
	payload?: MapPayloadProps<MappedError<Kind>> & MapPayloadProps<CustomProps>,
	logger?: LoggerFunction,
	options?: ErrorPayloadOptions,
): MappedError<Kind> & CustomProps;
export function errorOutcome<
	Kind extends ErrorKind,
	CustomProps extends Readonly<object> = {},
>(
	payload__payload__kind?:
		| Kind
		| (MapPayloadProps<MappedError<Kind>> & MapPayloadProps<CustomProps>),
	options__logger__payload?: unknown,
	undefined__options__logger?: unknown,
	undefined__undefined__options?: ErrorPayloadOptions,
): MappedError<Kind> & CustomProps {
	let kind: Kind;
	let payload:
		| (MapPayloadProps<MappedError<Kind>> & MapPayloadProps<CustomProps>)
		| null;
	let providedLogger: LoggerFunction | undefined;
	let options: ErrorPayloadOptions | undefined;

	if (
		typeof payload__payload__kind !== 'object' &&
		typeof payload__payload__kind !== 'undefined'
	) {
		// overload #3
		kind = payload__payload__kind as Kind;
		payload =
			(options__logger__payload as MapPayloadProps<MappedError<Kind>> &
				MapPayloadProps<CustomProps>) ?? null;
		providedLogger = undefined__options__logger as LoggerFunction;
		options = undefined__undefined__options;
	} else {
		// overload #1 or #2
		kind = GENERIC_ERROR as Kind;
		payload =
			(payload__payload__kind as MapPayloadProps<MappedError<Kind>> &
				MapPayloadProps<CustomProps>) ?? null;
		if (typeof options__logger__payload === 'function') {
			// overload #2
			providedLogger = options__logger__payload as LoggerFunction;
			options = undefined__options__logger as ErrorPayloadOptions;
		} else {
			// overload #1
			options = options__logger__payload as ErrorPayloadOptions;
		}
	}

	const { caughtException, message, context, ...rest } = payload ?? {};
	let stack: string | null;
	if (options?.stack === false) {
		stack = null;
	} else {
		stack = (new Error().stack ?? '')
			.split('\n')
			.slice(2)
			.join('\n')
			.trim();
	}

	const error: MappedError<Kind> & CustomProps = {
		[_errorOutcomeSym]: kind,
		...rest,
		context,
		caughtException,
		message,
		stack,
	} as MappedError<Kind> & CustomProps;

	if (providedLogger) {
		providedLogger(error);
	}

	return error;
}

export function isErrorOutcome(
	input: unknown,
): input is ErrorOutcome<ErrorKind> {
	if (
		typeof input === 'object' &&
		input !== null &&
		_errorOutcomeSym in input
	) {
		return true;
	}
	return false;
}

export function getErrorKind<K extends ErrorKind>(
	errorOutcome: ErrorOutcome<K>,
): K {
	return errorOutcome[_errorOutcomeSym];
}
