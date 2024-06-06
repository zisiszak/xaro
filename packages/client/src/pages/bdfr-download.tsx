import { useState } from 'react';
import { FormPrimitive } from '../styleguide/components/index.js';
import { Primitive } from '../styleguide/index.js';

export const BdfrDownloadPage: React.FC = () => {
	const [params, setParams] = useState<{
		subreddit: string;
		sort?: 'hot' | 'new' | 'top' | 'controversial';
		time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
		limit?: number;
		withMetadata?: boolean;
	}>({
		subreddit: '',
		sort: 'hot',
		time: 'all',
		limit: 100,
		withMetadata: true,
	});

	return (
		<>
			<Primitive.Section.Standard>
				<Primitive.Container.MD>
					<FormPrimitive.Form>
						<FormPrimitive.Title>
							Download Reddit Subreddit
						</FormPrimitive.Title>
						<FormPrimitive.ItemsContainer>
							<FormPrimitive.item.Container>
								<FormPrimitive.item.Label>
									Subreddit
								</FormPrimitive.item.Label>
								<FormPrimitive.item.Text
									value={params.subreddit}
									onChange={(e) =>
										setParams({
											...params,
											subreddit: e.target.value,
										})
									}
									placeholder="Enter a subreddit"
								/>
							</FormPrimitive.item.Container>
							<FormPrimitive.item.Container>
								<FormPrimitive.item.Label>
									Sort
								</FormPrimitive.item.Label>
								<FormPrimitive.item.Select
									value={params.sort}
									onChange={(e) =>
										setParams({
											...params,
											sort: e.target
												.value as typeof params.sort,
										})
									}
								>
									<option value="hot">Hot</option>
									<option value="new">New</option>
									<option value="top">Top</option>
									<option value="controversial">
										Controversial
									</option>
								</FormPrimitive.item.Select>
							</FormPrimitive.item.Container>
							<FormPrimitive.item.Container>
								<FormPrimitive.item.Label>
									Time
								</FormPrimitive.item.Label>
								<FormPrimitive.item.Select
									value={params.time}
									onChange={(e) =>
										setParams({
											...params,
											time: e.target
												.value as typeof params.time,
										})
									}
								>
									<option value="hour">Hour</option>
									<option value="day">Day</option>
									<option value="week">Week</option>
									<option value="month">Month</option>
									<option value="year">Year</option>
									<option value={'all'}>All-time</option>
								</FormPrimitive.item.Select>
							</FormPrimitive.item.Container>

							<FormPrimitive.item.Container>
								<FormPrimitive.item.Label>
									Limit
								</FormPrimitive.item.Label>
								<FormPrimitive.item.Text
									type="number"
									value={params.limit}
									min={0}
									onChange={(e) =>
										setParams({
											...params,
											limit: Number(e.target.value),
										})
									}
								/>
							</FormPrimitive.item.Container>
						</FormPrimitive.ItemsContainer>
						<FormPrimitive.buttons.Submit
							value={'Submit'}
							onClick={(e) => {
								e.preventDefault();
								if (!params.subreddit) return;

								console.log(params);

								fetch('/api/platform/extract/content/reddit', {
									method: 'POST',
									body: JSON.stringify({
										contentExtractorType: 'one-to-many',
										contentSource: params,
									}),
									headers: {
										'Content-Type': 'application/json',
									},
								})
									.then((res) => {
										console.log(res.status);
									})
									.catch((err) => {
										console.error(err);
									});
							}}
						/>
					</FormPrimitive.Form>
				</Primitive.Container.MD>
			</Primitive.Section.Standard>
		</>
	);
};
