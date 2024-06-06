import { logger } from '../../index.js';

export type UndoFunction = (() => Promise<void>) | (() => void);
type UndoStack = {
	symbol?: symbol;
	execute: UndoFunction;
};
export type AddUndo = (rollback: UndoFunction, symbol?: symbol) => void;

export const useUndo = () => {
	const undoStack: UndoStack[] = [];
	const addUndo: AddUndo = (rollback, symbol) =>
		undoStack.push({
			execute: rollback,
			symbol,
		});

	const undo = async (symbol?: symbol) => {
		let toUndo: UndoStack[];
		if (!!symbol) {
			toUndo = undoStack.filter((undo, i) => {
				if (undo.symbol === symbol) {
					undoStack.splice(i, 1);
					return true;
				}
				return false;
			});
		} else {
			toUndo = undoStack.splice(0);
		}

		return Promise.all(
			toUndo.map((undo) => {
				try {
					undo.execute();
				} catch (err) {
					logger.error({
						err,
					});
				}
			}),
		);
	};

	const clear = (symbol?: symbol) => {
		if (!!symbol) {
			undoStack.forEach((undo, i) => {
				if (undo.symbol === symbol) {
					undoStack.splice(i, 1);
				}
			});
		} else {
			undoStack.length = 0;
		}
	};
	return { clear, addUndo, undo };
};
