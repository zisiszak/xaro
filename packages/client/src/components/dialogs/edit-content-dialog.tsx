import { ServerAPI } from '@xaro/server';
import { useEffect, useState } from 'react';
import { fetchAboutContent } from '../../model/fetch-endpoints/content';
import { FormPrimitive } from '../../styleguide/components';
import { Tag, TagsFlex } from '../content-item/column-item.styles';
import { GenericDialog } from './shared';

export interface EditContentDialogProps {
	Trigger: React.ComponentType<{ onClick: () => void }>;
	contentId: number;
	updateContentData: (data: ServerAPI.UpdateContent.Body) => void;
}

export const EditContentDialog: React.FC<EditContentDialogProps> = ({
	Trigger,
	contentId,
	updateContentData,
}) => {
	const [aboutContent, setAboutContent] =
		useState<ServerAPI.GetAboutContent.Success | null>(null);
	const [updates, setUpdates] = useState<ServerAPI.UpdateContent.Body>({});
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const tagList = (updates.sorting?.tags ??
		aboutContent?.sorting.tags.map(({ displayName }) => displayName) ??
		[]) as string[];

	useEffect(() => {
		if (!isOpen) {
			setUpdates({});
			return;
		}
		fetchAboutContent(contentId).then(setAboutContent).catch(console.error);
	}, [isOpen]);

	const setTagsUpdate = (tags: string[]) => {
		setUpdates((prev) => ({
			...prev,
			sorting: {
				...prev.sorting,
				tags: Array.from(new Set(tags)),
			},
		}));
	};

	return (
		<>
			<Trigger onClick={() => setIsOpen(true)} />
			{isOpen && (
				<GenericDialog
					title={'Edit Content Data'}
					close={() => setIsOpen(false)}
				>
					<FormPrimitive.Form>
						<FormPrimitive.ItemsContainer>
							<FormPrimitive.item.Container>
								<FormPrimitive.item.Label>
									Tags
								</FormPrimitive.item.Label>
								<TagsFlex>
									{tagList.map((name, key) => (
										<Tag key={key}>{name}</Tag>
									))}
								</TagsFlex>
								<FormPrimitive.item.Text
									placeholder="Enter comma separated tags"
									defaultValue={
										tagList.join(', ') ?? undefined
									}
									onInput={(e) => {
										setTagsUpdate(
											e.currentTarget.value
												.split(',')
												.map((i) => i.trim())
												.filter((i) => i !== ''),
										);
									}}
									onChange={(e) => {
										setTagsUpdate(
											e.currentTarget.value
												.split(',')
												.map((i) => i.trim())
												.filter((i) => i !== ''),
										);
									}}
								/>
							</FormPrimitive.item.Container>
						</FormPrimitive.ItemsContainer>
						<FormPrimitive.buttons.Submit
							value="Save Changes"
							onClick={(e) => {
								e.preventDefault();
								if (Object.keys(updates).length === 0) {
									return;
								}

								updateContentData(updates);
							}}
						/>
					</FormPrimitive.Form>
				</GenericDialog>
			)}
		</>
	);
};
