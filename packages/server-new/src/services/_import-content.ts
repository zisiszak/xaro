// import { type GenericError } from 'exitus';
// import { is } from 'is-guard';
// import { type FileMetadata, type FileOriginTag } from '~/models/database/tables/files.js';
// import { Content } from '~/models/database/tables/index.js';
// import { sequentialAsync } from '~/utils/sequential-async.js';
// import { importContentFile } from './_import-content-file.js';

// interface ImportContentFromUnimportedFilesProps {
// 	files: {
// 		original: {
// 			filePath: string;
// 			sourceTag: FileOriginTag;
// 			sourceUrl?: string;
// 			metadata?: Partial<FileMetadata>;
// 		};
// 		supporting?: {
// 			filePath: string;
// 			sourceTag: FileOriginTag;
// 			sourceUrl?: string;
// 			sourceFileHash?: string;
// 			metadata?: Partial<FileMetadata>;
// 			relTag: Exclude<
// 				ContentLinkedFileRelationshipTag,
// 				typeof ContentLinkedFileRelationshipTagEnum.Content
// 			>;
// 		}[];
// 	};
// 	userLink: {
// 		userID: number;
// 		isPrivate: boolean;
// 	};
// }

// export async function importContent(props: ImportContentFromUnimportedFilesProps): Promise<
// 	ErrorResultTuple<{
// 		contentID: number;
// 		originalFileID: number;
// 		supportingFileIDs: number[];
// 	}>
// > {
// 	const {
// 		files,
// 		userLink: { userID, isPrivate },
// 	} = props;

// 	const [contentEntryError, contentID] = await Content.insertIncomplete({
// 		importedByUserID: userID,
// 		isPrivate,
// 	});
// 	if (contentEntryError) return [contentEntryError];

// 	const undoContentEntry = () => Content.remove(contentID);

// 	const [originalFileImportError, originalFileID] = await importContentFile({
// 		...files.original,
// 		contentID,
// 		relTag: ContentLinkedFileRelationshipTagEnum.Content,
// 		ownerID: userID,
// 	});
// 	if (originalFileImportError) {
// 		await undoContentEntry();
// 		return [originalFileImportError];
// 	}

// 	const supportingFileIDs: Array<number | GenericError> = files.supporting
// 		? await sequentialAsync(
// 				(props) =>
// 					importContentFile({ ...props, ownerID: userID, contentID }).then((result) =>
// 						typeof result[0] === 'undefined' ? result[1] : result[0],
// 					),
// 				files.supporting,
// 				true,
// 			)
// 		: [];

// 	return [
// 		undefined,
// 		{
// 			contentID,
// 			originalFileID,
// 			supportingFileIDs: supportingFileIDs.filter(is.number),
// 		},
// 	];
// }
