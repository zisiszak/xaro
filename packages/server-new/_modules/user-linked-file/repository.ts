import { sql, type Insertable, type Selectable } from 'kysely';
import { UserRepository } from '~/_modules/user/index.js';
import { xaro } from '~/index.js';
import { FileRepository } from '../index.js';

export interface Table {
	user_id: number;
	file_id: number;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;

export const TABLE_NAME = 'USER_LINKED_FILES';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.addColumn('user_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${UserRepository.TABLE_NAME}.id`)
			.onDelete('cascade')
			.onUpdate('cascade'),
	)
	.addColumn('file_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${FileRepository.TABLE_NAME}.id`)
			.onUpdate('cascade')
			.onDelete('cascade')
			.modifyEnd(sql`,UNIQUE(file_id, user_id)`),
	)
	.compile();
