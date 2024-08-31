import { type DeleteResult } from 'kysely';

/**
 *
 * @returns `null` if `numDeletedRows` is 0.
 * @returns `undefined` if `numDeletedRows` is not 0.
 */
export const singleDeletionResultAsNullOrUndefined = (result: DeleteResult): null | undefined =>
	Number(result.numDeletedRows) === 0 ? null : undefined;
