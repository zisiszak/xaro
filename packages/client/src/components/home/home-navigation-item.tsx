import * as S from './home-navigation-item.styles';

export type HomeNavigationItemProps = {
	kind: string;
	title: string;
	description?: string;
	icon: React.ReactNode;
	href: string;
};
export const HomeNavigationItem: React.FC<HomeNavigationItemProps> = ({
	kind,
	title,
	description,
	icon,
	href,
}) => (
	<S.Wrap href={href}>
		<S.DetailsIconWrap>
			<S.DetailsWrap>
				<S.Kind>{kind}</S.Kind>
				<S.Title>{title}</S.Title>
				{description && <S.Description>{description}</S.Description>}
			</S.DetailsWrap>
			<S.IconWrap>
				<S.IconPlate />
				<S.Icon>{icon}</S.Icon>
			</S.IconWrap>
		</S.DetailsIconWrap>
	</S.Wrap>
);
