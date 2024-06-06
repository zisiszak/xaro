import { type ServerAPI } from '@zmh/server';
import { useViewPreferences } from '../../model/context/view-preferences';
import { BasicThumbnail } from './basic';

export const Thumbnail: React.FC<{
	content: ServerAPI.GetAboutContent.Success;
	onClick: () => void;
}> = ({ content, onClick }) => {
	const { viewPreferences } = useViewPreferences();
	const { id } = content.record;

	return (
		<BasicThumbnail
			key={id}
			onClick={onClick}
			mediaItem={content}
			viewPreferences={viewPreferences}
		/>
	);
};
