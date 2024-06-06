import { useState } from 'react';
import styled, { css } from 'styled-components';
import { Tag } from '../../components/content-item/column-item.styles';

const TagToggle = styled(Tag)<{
	$selected: boolean;
}>`
	user-select: none;
	cursor: pointer;
	${({ $selected }) =>
		!$selected &&
		css`
			opacity: 0.5;
		`}
`;

export const SortingTagFilter: React.FC<{
	displayName: string;
	id: number;
	count: number;
	toggleSelection: (displayName: string) => void;
	initiallySelected: boolean;
}> = ({
	displayName,
	count,
	toggleSelection,
	initiallySelected: initialSelected,
}) => {
	const [selected, setSelected] = useState(initialSelected);
	return (
		<TagToggle
			$selected={selected}
			onClick={() => {
				toggleSelection(displayName);
				setSelected(!selected);
			}}
		>
			{displayName} ({count})
		</TagToggle>
	);
};
