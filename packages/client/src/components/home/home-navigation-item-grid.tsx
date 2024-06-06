import { type PropsWithChildren } from 'react';
import * as S from './home-navigation-item-grid.styles';

export type HomeNavigationItemGridProps = {
	title: string;
};
export const HomeNavigationItemGrid: React.FC<
	HomeNavigationItemGridProps & PropsWithChildren
> = ({ title, children }) => {
	if (!children) {
		return null;
	}

	return (
		<S.Section>
			<S.Container>
				<S.SectionTitle>{title}</S.SectionTitle>
				<S.Grid>{children}</S.Grid>
			</S.Container>
		</S.Section>
	);
};
