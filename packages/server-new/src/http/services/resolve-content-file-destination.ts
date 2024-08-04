import path from 'path';
import { xaro } from '~/index.js';
import { type ContentFileRelationshipTag } from '~/models/database/tables/content-files.js';

const maxUniqueIdsPerDir = 100;

interface ResolveContentFileDestinationProps {
	contentID: number;
	fullHash: string;
	relTag: ContentFileRelationshipTag;
}
export function resolveContentFileDestination({
	contentID,
	fullHash,
	relTag,
}: ResolveContentFileDestinationProps): {
	dir: string;
	basename: string;
} {
	return {
		dir: path.join(
			xaro.config.rootDir,
			'imports',
			'content',
			Math.floor(contentID / maxUniqueIdsPerDir).toString(),
		),
		basename: `${contentID.toString().padStart(7, '0')}[${relTag.toString().padStart(2, '0')}]${fullHash}`,
	};
}
