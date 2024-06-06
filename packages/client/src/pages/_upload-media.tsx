import { type ServerAPI } from '@xaro/server';
import { cleanInt } from '@xaro/utils';
import { sha1 } from 'js-sha1';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { UploadMediaFormItemFieldset } from '../components/upload-media/form-item-fieldset.js';
import { FormPrimitive } from '../styleguide/components/index.js';
import * as S from './_upload-media.styles.js';

const handleFormSubmit = async (fields: Record<string, any>, files: File[]) => {
	if (files.length === 0) {
		return Promise.reject();
	}

	const dt = new DataTransfer();
	files.forEach((file) => {
		dt.items.add(file);
	});

	const fd = new FormData();
	for (const key in fields) {
		const value = fields[key] as unknown;
		if (typeof value === 'undefined') continue;
		const parsed =
			typeof value === 'boolean'
				? value
					? '1'
					: '0'
				: typeof value === 'number' || typeof value === 'string'
					? value.toString()
					: JSON.stringify(value);
		fd.append(key, parsed);
	}

	for (let i = 0; i < dt.files.length; i++) {
		fd.append('files', dt.files.item(i)!);
	}
	const response = fetch('/api/media/upload', {
		method: 'post',
		body: fd,
	});
	return response;
};

export const UploadMediaPage: React.FC = () => {
	const [uploading, setUploading] = useState<boolean | null>(null);
	const filesInputRef = useRef<HTMLInputElement>(null);
	const [files, setMediaFiles] = useState<
		{
			hashedFilename: string;
			file: File;
		}[]
	>([]);
	const [warningMessages, setWarningMessages] = useState<string[]>([]);
	const [submissionErrors, setSubmissionErrors] = useState<{
		fieldsets: string[];
		server?: string[];
	}>({
		fieldsets: [],
		server: [],
	});
	const currentQuery = queryString.parse(window.location.search);
	// eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
	const [sharedOptions, _setSharedOptions] =
		useState<ServerAPI.Media.UploadMediaFiles.GlobalFormFields>({
			mediaFile_anyoneCanRemove: false,
			mediaFile_isPrivate: false,
			mediaItem_anyoneCanEdit: false,
			mediaItem_anyoneCanRemove: false,
			mediaItem_isPrivate: false,
			mediaItem_platformId: cleanInt(currentQuery.platformId),
			mediaItem_platformProfileId: cleanInt(
				currentQuery.platformProfileId,
			),
			// TODO: make this properly typed
			mediaItem_source: cleanInt(currentQuery.source) === 1 ? 1 : 0,
		});
	const [fileFields, setFileFields] =
		useState<ServerAPI.Media.UploadMediaFiles.FileFieldsetFields>({});
	const updateFileField = (
		key: keyof ServerAPI.Media.UploadMediaFiles.FileFieldsetFields,
		value: unknown,
	) => {
		const existing = fileFields[key];
		if (existing === value) return;
		setFileFields((prev) => ({
			...prev,
			[key]: value === '' ? undefined : value,
		}));
	};
	const removeFileFields = (hashedFilename: string) => {
		setFileFields(
			Object.fromEntries(
				Object.entries(fileFields).filter(
					(entry) =>
						entry[0].startsWith(`file_${hashedFilename}`) === false,
				),
			),
		);
	};

	const handleFileInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		if (!event.target.files) {
			return;
		}

		const invalidFiles: {
			name: string;
			size: number;
			type: string;
		}[] = [];
		const newFiles = Array.from(event.target.files)
			.map((file) => {
				if (
					file.type.startsWith('image/') === false &&
					file.type.startsWith('video/') === false
				) {
					invalidFiles.push({
						name: file.name,
						size: file.size,
						type: file.type,
					});
					return null;
				}
				return {
					hashedFilename: sha1(file.name),
					file,
				};
			})
			// OK this is dumb. This syntax works in a .ts file but not in a .tsx file. Needs to be an extension/plugin for typescript that provides a comment option to ignore jsx syntax for the next line.
			// .filter(<T>(file: T | null): file is T => file !== null);
			.filter(
				(
					file,
				): file is {
					hashedFilename: string;
					file: File;
				} => file !== null,
			);

		setMediaFiles(newFiles);
		if (invalidFiles.length > 0) {
			setWarningMessages(
				invalidFiles.map(
					(file) =>
						`Selected file "${file.name}" could not be added, as it is an unsupported file type (${file.type}). Only images and videos are allowed.`,
				),
			);
		}
	};

	const removeFileInput = (hashedFilename: string) => () => {
		if (!filesInputRef.current) return;
		const newFiles = files.filter(
			(file) => file.hashedFilename !== hashedFilename,
		);
		const dt = new DataTransfer();
		newFiles.forEach((file) => {
			dt.items.add(file.file);
		});
		// this might break
		filesInputRef.current.files = dt.files;
		setMediaFiles(newFiles);
		removeFileFields(hashedFilename);
	};

	const mappedFiles = files.map((file) => ({
		file: file.file,
		hashedFilename: file.hashedFilename,
		filename: file.file.name,
		size: file.file.size,
		type: file.file.type,
		updateField: updateFileField,
		removeFileInput: removeFileInput(file.hashedFilename),
	}));

	console.log('Mapped files:', mappedFiles);

	return (
		<>
			<S.Container>
				<FormPrimitive.Form
					onSubmit={(e) => {
						e.preventDefault();
						const fields = {
							...fileFields,
							...sharedOptions,
						};
						const fieldsetErrorIds = Object.entries(fields)
							.map(([key, value]) => {
								// if (isErr(value)) {
								// 	// eslint-disable-next-line @typescript-eslint/no-unused-vars
								// 	const [_file, hashedFilename] = key.split(
								// 		'_',
								// 	) as [string, string];
								// 	return hashedFilename;
								// }
								return null;
							})
							.filter((v): v is string => v !== null);
						if (fieldsetErrorIds.length > 0) {
							console.error(
								'Form fields have errors:',
								fieldsetErrorIds,
							);
							setSubmissionErrors({
								fieldsets: fieldsetErrorIds,
								server: [],
							});
							return;
						}

						setUploading(true);
						console.log(fields);
						handleFormSubmit(
							fields,
							files.map((f) => f.file),
						)
							.then((res) => {
								console.log(`${res.status} ${res.statusText}`);

								if (res.status === 200) {
									setMediaFiles([]);
									setFileFields({});
									setWarningMessages([]);
									setSubmissionErrors({
										fieldsets: [],
										server: [],
									});
									setUploading(false);
								} else {
									setUploading(null);
									setSubmissionErrors({
										fieldsets: [],
										server: [res.statusText],
									});
								}
							})
							.catch((err) => {
								console.error(err);
							});
					}}
				>
					<FormPrimitive.Title>Upload Media</FormPrimitive.Title>
					<FormPrimitive.Description>
						Upload images and videos to the server.
					</FormPrimitive.Description>
					<FormPrimitive.ItemsContainer>
						<FormPrimitive.item.Container>
							{files.length > 0 && (
								<FormPrimitive.item.Label htmlFor="mediaFiles">
									{files.length} file
									{files.length === 1 ? '' : 's'} selected
								</FormPrimitive.item.Label>
							)}
							<FormPrimitive.item.Files
								multiple
								required
								onChange={handleFileInputChange}
								accept="image/*,video/*"
								ref={filesInputRef}
							/>
						</FormPrimitive.item.Container>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label htmlFor="mediaItem_source">
								Source
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Select
								id="mediaItem_source"
								onChange={(e) =>
									_setSharedOptions((prev) => ({
										...prev,
										mediaItem_source: cleanInt(
											e.target.value,
										),
									}))
								}
							>
								<option value="0">User</option>
								<option value="1">Platform</option>
							</FormPrimitive.item.Select>
						</FormPrimitive.item.Container>
					</FormPrimitive.ItemsContainer>
					{mappedFiles.length > 0 && (
						<>
							<S.FileFieldsetsTitle>
								Customise Imports
							</S.FileFieldsetsTitle>
							<S.FileFieldsets>
								{mappedFiles.map((file, i) => (
									<UploadMediaFormItemFieldset
										{...file}
										key={i}
										index={i}
									/>
								))}
							</S.FileFieldsets>
						</>
					)}
					<FormPrimitive.buttons.Submit value={'Upload'} required />
					{uploading === true && <p>Uploading...</p>}
					{uploading === false && <p>Upload successful!</p>}
					{submissionErrors.fieldsets.length > 0 && (
						<ul>
							{submissionErrors.fieldsets.map(
								(hashedFilename, i) => {
									const file = files.find(
										(f) =>
											f.hashedFilename === hashedFilename,
									);
									if (!file) {
										return null;
									}
									return (
										<li key={i}>
											Custom options for {file.file.name}{' '}
											are invalid.{' '}
											<a href={`#${hashedFilename}`}>
												Review options
											</a>
										</li>
									);
								},
							)}
						</ul>
					)}
					{submissionErrors.server &&
						submissionErrors.server.length > 0 && (
							<ul>
								{submissionErrors.server.map((msg, i) => (
									<li key={i}>{msg}</li>
								))}
							</ul>
						)}
					{warningMessages.length > 0 && (
						<ul>
							{warningMessages.map((msg, i) => (
								<li key={i}>{msg}</li>
							))}
						</ul>
					)}
				</FormPrimitive.Form>
			</S.Container>
		</>
	);
};
