import { type ServerAPI } from '@xaro/server';
import * as S from './tile.styles.js';

export type PlatformTileProps = ServerAPI.GetAboutPlatform.Result;
export const PlatformTile: React.FC<PlatformTileProps> = (props) => {
	if (!props) {
		return null;
	}
	const { name, displayName, description } = props;

	return (
		<S.Wrap href={`/platforms/${name}`}>
			<S.DetailsWrap>
				<S.Name>{displayName}</S.Name>
				{description && <S.Description>{description}</S.Description>}
			</S.DetailsWrap>
		</S.Wrap>
	);
};
