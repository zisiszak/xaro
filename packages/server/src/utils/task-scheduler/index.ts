import { logger } from '../../index.js';
import { sequentialAsync } from '../async/sequential-async.js';
import {
	type CreateTask,
	type InternalQueuedWorker,
	type QueueWorker,
	type TaskExecutionParams,
	type TaskParams,
	type Tasks,
	type WorkerQueue,
} from './types.js';

const tasks: Tasks = new Map();
const workQueue: WorkerQueue = new Map();

export const createTask: CreateTask = <
	Result,
	WorkerParams extends object | undefined,
	WorkerStatus,
>({
	symbol,
	maxConcurrency,
	killOldestWhenMaxReached,
	task,
}: TaskParams<Result, WorkerParams, WorkerStatus>) => {
	if (tasks.has(symbol) || workQueue.has(symbol)) {
		logger.error(
			{
				symbol,
				task,
			},
			'Could not add task: Symbol already in tasks map',
		);
		throw new Error('Symbol already in tasks map');
	}

	tasks.set(symbol, {
		maxConcurrency,
		killOldestWhenMaxReached,
		task,
	});
	workQueue.set(symbol, []);

	const queueWorker: QueueWorker<Result, WorkerParams, WorkerStatus> = (
		_scheduling,
		workerParams,
	) => {
		const currentWorkers = workQueue.get(symbol);
		if (!currentWorkers) {
			throw new Error(
				"Cannot queue a worker when it's corresponding task is no longer defined.",
			);
		}

		if (isFinite(maxConcurrency)) {
			if (killOldestWhenMaxReached === true) {
				const runningTasks = currentWorkers.filter(
					(task) => task.running === true,
				);
				const diff = runningTasks.length - maxConcurrency;
				if (diff > 0) {
					// TODO: Update the TaskExecutionParams type and the QueueTask type to adapt to async/sync task types
					runningTasks.slice(0, diff).map((running) => {
						try {
							running.kill && void running.kill();
						} catch (err) {
							logger.error(
								{
									error: err,
									runningTask: running,
								},
								'Failed to kill task',
							);
						}
						// Uhh, does this cause a memory issue? Idk frankly, and I don't care (I kinda do tho)
						currentWorkers.splice(
							runningTasks.findIndex((task) => task === running),
							1,
						);
					});
				}
			}
		}
		const internalQueuedWorker: InternalQueuedWorker<Result, WorkerStatus> =
			{
				async kill() {
					if (this.finished || this.running === false) {
						return;
					}

					this.killed = true;
					this.running = false;
					await sequentialAsync(
						async (fn) => fn(),
						this.executeKillCallbacks,
						true,
					);
				},
				registerKillWorkerCallback(fn) {
					this.executeKillCallbacks.push(fn);
				},
				getCurrentStatus() {
					if (this.running || this.finished) {
						return this.stati[this.stati.length - 1];
					} else {
						throw new Error(
							'Cannot get status for a worker that is neither running, nor finished.',
						);
					}
				},
				addStatus(status) {
					this.stati.push(status);
				},
				start() {
					try {
						if (
							this.running ||
							this.finished ||
							this.killed ||
							this.cancelled
						) {
							throw new Error(
								"Can't start a queued worker which has already finished processing",
							);
						}

						const executionParams: TaskExecutionParams<WorkerStatus> =
							{
								registerKillWorkerCallback: (cb) =>
									this.registerKillWorkerCallback(cb),
								addStatus: (status) => this.addStatus(status),
							};

						if (typeof workerParams === 'object') {
							this.result = task(executionParams, workerParams);
						} else {
							this.result = task(executionParams, workerParams);
						}

						if (this.result instanceof Promise) {
							this.result
								.then(
									(
										result: Result extends Promise<infer R>
											? R
											: never,
									) => {
										this.result = result;
									},
								)
								.catch((err) => {
									this.error = err;
									this.running = false;
									this.finished = true;
								});
						}

						this.running = true;
					} catch (error) {
						this.error = error;
						this.finished = true;
						this.running = false;
					}
				},
				cancel() {
					if (this.running === true || this.finished === true) {
						return false;
					}
					this.cancelled = true;
					this.finished = true;
					return true;
				},

				cancelled: false as boolean,
				running: false as boolean,
				finished: false as boolean,
				killed: false as boolean,
				stati: [],
				executeKillCallbacks: [],
			};

		workQueue.set(symbol, [
			...currentWorkers,
			internalQueuedWorker as InternalQueuedWorker<unknown, unknown>,
		]);

		return {
			getCurrentStatus: () => internalQueuedWorker.getCurrentStatus(),
			cancel: () => internalQueuedWorker.cancel(),
			start: () => internalQueuedWorker.start(),
			kill: () => internalQueuedWorker.kill(),
			get result() {
				if (internalQueuedWorker.result) {
					return internalQueuedWorker.result as Result extends Promise<
						infer R
					>
						? R
						: Result;
				} else {
					throw new Error(
						'Cannot get result for a worker that has not started.',
					);
				}
			},
		};
	};

	const getWorkerQueue = () => {
		const queue = workQueue.get(symbol) as InternalQueuedWorker<
			Result,
			WorkerStatus
		>[];
		if (!queue) {
			throw new Error(
				'Cannot get a worker queue for a job which is no longer defined.',
			);
		}
		return [...queue] as const;
	};

	return {
		queueWorker: queueWorker,
		getWorkerQueue: getWorkerQueue,
	};
};
