import queryString from 'query-string';
import { Primitive } from '../../styleguide';
import { FormPrimitive } from '../../styleguide/components';

export const PaginationBar: React.FC<{
	itemLimit: number;
	pageNumber: number;
	totalItemCount: number;
}> = ({ itemLimit, pageNumber, totalItemCount }) => {
	const totalPageCount = Math.ceil(totalItemCount / itemLimit) ?? 0;

	const updateSearchLocation = (page: number) => () => {
		window.location.search = queryString.stringify({
			...queryString.parse(location.search),
			page,
		});
	};

	return (
		<Primitive.Section.Standard>
			<Primitive.Container.SM>
				{pageNumber > 1 && (
					<FormPrimitive.buttons.Submit
						as="button"
						onClick={updateSearchLocation(pageNumber - 1)}
					>
						Previous
					</FormPrimitive.buttons.Submit>
				)}
				Page {pageNumber} of {totalPageCount} - {totalItemCount} items
				found
				{totalPageCount > pageNumber && (
					<FormPrimitive.buttons.Submit
						as="button"
						onClick={updateSearchLocation(pageNumber + 1)}
					>
						Next
					</FormPrimitive.buttons.Submit>
				)}
			</Primitive.Container.SM>
		</Primitive.Section.Standard>
	);
};
