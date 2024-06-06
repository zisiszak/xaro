import styled from 'styled-components';
import { Primitive } from '../../styleguide';
import { colour } from '../../styleguide/colour';
import { factor } from '../../styleguide/factor';
import { mediaQuery } from '../../styleguide/media-query';

export const Section = styled(Primitive.Section.Standard)``;

export const Container = styled(Primitive.Container.LG)``;

export const SectionTitle = styled.h2`
	margin-bottom: 0.75em;

	font-size: ${factor.XL(1)};
	font-weight: 700;
	line-height: 1.25;

	color: ${colour.text.main};
`;

export const Grid = styled.div`
	display: grid;
	gap: ${factor.LG(1)};

	${mediaQuery.minWidth.MD} {
		grid-template-columns: 1fr 1fr;
	}
`;
