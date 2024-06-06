import { type ServerAPI } from '@xaro/server';
import { memo, useEffect, useState } from 'react';
import FilePlayer from 'react-player/file';
import { FormPrimitive } from '../../styleguide/components/index.js';
import { formatBytes } from '../../utils/parsing-and-sorting/bytes-to.js';
import * as S from './form-item-fieldset.styles.js';

export type UploadMediaFormItemFieldset = {
	filename: string;
	hashedFilename: string;
	size: number;
	type: string;
	file: File;
	index: number;
	updateField: (
		key: keyof ServerAPI.Media.UploadMediaFiles.FileFieldsetFields,
		value: unknown,
	) => void;
	removeFileInput: () => void;
};
const uploadMediaFormItemFieldset: React.FC<UploadMediaFormItemFieldset> = ({
	filename,
	hashedFilename,
	size,
	updateField,
	removeFileInput,
	type,
	file,
}) => {
	// const [fields, setFields] =
	// useState<ServerAPI.Media.UploadMediaFiles.FileFieldsetFields>({});
	// useEffect(() => {
	// setFieldset(fields);
	// }, [hashedFilename]);
	const [optionsOpen, setOptionsOpen] = useState(false);
	const [url, setUrl] = useState<string | null>(null);
	// console.log(fields);

	useEffect(() => {
		setUrl(URL.createObjectURL(file));
	}, [file]);

	const kind = type.split('/')[0] as 'image' | 'video';
	const fileExt = (type.split('/')[1] ?? 'file').toUpperCase();

	return (
		<S.Fieldset id={hashedFilename}>
			<S.AllButButtonsContainer>
				<S.FieldsetLegend>
					<S.FilenameThumbnailContainer>
						{kind === 'image' && url && (
							<S.FileThumbnail
								className={
									optionsOpen ? 'collapsed' : undefined
								}
								src={url}
								alt={filename}
							/>
						)}
						<S.FileNameLabel>{filename}</S.FileNameLabel>
					</S.FilenameThumbnailContainer>
					<S.FileDetailsContainer>
						<S.FileSizeLabel>{formatBytes(size)}</S.FileSizeLabel>
						<S.FileExtLabel>{fileExt}</S.FileExtLabel>
					</S.FileDetailsContainer>
				</S.FieldsetLegend>
				{optionsOpen && (
					<>
						<S.PreviewContainer>
							{kind === 'image' && url && (
								<S.ImagePreview src={url} alt={filename} />
							)}
							{kind === 'video' && url && (
								<FilePlayer
									url={url}
									controls={true}
									width="100%"
									playing={false}
									height={'auto'}
									stopOnUnmount={true}
									playsinline={true}
								/>
							)}
						</S.PreviewContainer>
						<S.ItemsContainer>
							<FormPrimitive.item.Container>
								<FormPrimitive.item.Label
									htmlFor={`file_${hashedFilename}_sourceTitle`}
								>
									Custom Title
								</FormPrimitive.item.Label>
								<FormPrimitive.item.Text
									id={`file_${hashedFilename}_sourceTitle`}
									onChange={(e) =>
										updateField(
											`file_${hashedFilename}_mediaItem_sourceTitle`,
											e.target.value,
										)
									}
									placeholder="Enter a title (optional)"
								/>
							</FormPrimitive.item.Container>
							<FormPrimitive.item.Container>
								<FormPrimitive.item.Label
									htmlFor={`file_${hashedFilename}_sourceDescription`}
								>
									Description
								</FormPrimitive.item.Label>
								<FormPrimitive.item.Text
									as="textarea"
									id={`file_${hashedFilename}_sourceDescription`}
									onChange={(e) =>
										updateField(
											`file_${hashedFilename}_mediaItem_sourceDescription`,
											e.target.value,
										)
									}
									placeholder="Enter a description (optional)"
								/>
							</FormPrimitive.item.Container>
						</S.ItemsContainer>
					</>
				)}
			</S.AllButButtonsContainer>
			<S.ButtonsContainer>
				<S.OptionsButton
					type="button"
					onClick={() => setOptionsOpen((prev) => !prev)}
				>
					{optionsOpen ? 'Hide' : 'Show'} Options
				</S.OptionsButton>
				<S.RemoveButton type="button" onClick={removeFileInput}>
					Remove
				</S.RemoveButton>
			</S.ButtonsContainer>
		</S.Fieldset>
	);
};

export const UploadMediaFormItemFieldset = memo(uploadMediaFormItemFieldset);
