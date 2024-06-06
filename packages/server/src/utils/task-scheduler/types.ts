/**
 * Syntax - `day/hour:min:sec`
 */
export type SimpleTimeSchedule = `${number}/${number}:${number}:${number}`;

/**
 * Used to terminate a worker currently running, if necessary (for example, accessing write streams).
 */
export type RegisterKillWorkerCallback = (
	fn: () => Promise<void> | void,
) => void;
export type AddStatus<Status = unknown> = (status: Status) => void;

export type TaskExecutionParams<Status = unknown> = {
	registerKillWorkerCallback: RegisterKillWorkerCallback;
	addStatus: AddStatus<Status>;
};

export type Task<
	Result,
	WorkerParams extends object | undefined,
	WorkerStatus = unknown,
> = (
	executionParams: TaskExecutionParams<WorkerStatus>,
	workerParams: WorkerParams,
) => Result;

export type TaskParams<
	Result,
	WorkerParams extends object | undefined,
	WorkerStatus = unknown,
> = {
	symbol: symbol;

	/**
	 * Defines if the worker can run concurrently with a max of `n` instances at a given moment. If the number is `0`, no concurrency is allowed for the worker.
	 * @default 0
	 */
	maxConcurrency: number;

	/**
	 * If true, will attempt to kill the oldest worker to make room for the new worker. Otherwise, old worker will be awaited.
	 * @default false
	 */
	killOldestWhenMaxReached?: boolean;

	readonly task: Task<Result, WorkerParams, WorkerStatus>;
};

export type QueuedWorkerFinished<Result> = {
	running: boolean;
	finished: true;
} & (
	| {
			killed?: true;
			result?: never;
			error?: never;
	  }
	| {
			killed?: false;
			result?: never;
			error: unknown;
	  }
	| {
			killed?: false;
			result: Result extends Promise<infer R> ? R : Result;
			error?: never;
	  }
);
export type QueuedWorkerState = {
	running: boolean;
	finished: boolean;
	killed: boolean;
	cancelled: boolean;
	error?: unknown;
};

export type InternalQueuedWorker<Result, WorkerStatus = unknown> = {
	start(): void;
	getCurrentStatus(): WorkerStatus | void;
	addStatus: AddStatus<WorkerStatus>;
	registerKillWorkerCallback: RegisterKillWorkerCallback;
	kill(): void | Promise<void>;
	/**
	 * @returns `true` if successfully cancelled, or `false` if the worker is already running/finished processing.
	 */
	cancel(): boolean;

	running: boolean;
	finished: boolean;
	killed: boolean;
	cancelled: boolean;
	error?: unknown;
	result?: Result | (Result extends Promise<infer R> ? R : Result);

	// lol
	readonly stati: WorkerStatus[];
	readonly executeKillCallbacks: (() => Promise<void> | void)[];
} & (QueuedWorkerFinished<Result> | QueuedWorkerState);

/**
 * @returns The instanceId of the newly queued worker.
 * @throws {Error} If input params are invalid
 */
export type QueueWorker<
	Result,
	WorkerParams extends object | undefined = undefined,
	WorkerStatus = unknown,
> = (
	scheduling: {
		/**
		 * @default 'no-repeat'
		 */
		every: SimpleTimeSchedule | 'no-repeat';

		/**
		 * @default 'now'
		 */
		startAt?: SimpleTimeSchedule | 'now';
	},
	workerParams: WorkerParams,
) => Pick<
	InternalQueuedWorker<Result, WorkerStatus>,
	'start' | 'kill' | 'getCurrentStatus' | 'cancel'
> & {
	get result(): Result extends Promise<infer R> ? R : Result;
};

export type CreateTask = <
	Result,
	WorkerParams extends object | undefined,
	WorkerStatus = unknown,
>(
	taskParams: TaskParams<Result, WorkerParams, WorkerStatus>,
) => {
	queueWorker: QueueWorker<Result, WorkerParams, WorkerStatus>;
	getWorkerQueue: () => readonly InternalQueuedWorker<Result, WorkerStatus>[];
};

export type Tasks = Map<symbol, Omit<TaskParams<any, any, any>, 'symbol'>>;
export type WorkerQueue = Map<symbol, InternalQueuedWorker<unknown, unknown>[]>;
