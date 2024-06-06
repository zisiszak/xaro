export type DefaultOnTypes<
	EMPTY_STRING extends boolean,
	UNDEFINED extends boolean,
	NULL extends boolean,
	ZERO extends boolean,
> = {
	EMPTY_STRING?: EMPTY_STRING;
	UNDEFINED?: UNDEFINED;
	NULL?: NULL;
	ZERO?: ZERO;
};

export type DefaultsMergerConfig<
	T,
	Defaults extends Partial<T>,
	EMPTY_STRING extends boolean,
	UNDEFINED extends boolean,
	NULL extends boolean,
	ZERO extends boolean,
> = {
	defaults: Defaults;
	defaultOnTypes?: DefaultOnTypes<EMPTY_STRING, UNDEFINED, NULL, ZERO>;
};

// This literally just became a thing of me just overengineering for the fun of it.
// I mean, it's sorta cool/satisfying to have the types correctly inferred?? lol idk
export function defaultsMerger<
	T,
	Defaults extends T = T,
	EMPTY_STRING extends boolean = true,
	UNDEFINED extends boolean = true,
	NULL extends boolean = true,
	ZERO extends boolean = false,
>({
	defaults,
	defaultOnTypes = {},
}: DefaultsMergerConfig<T, Defaults, EMPTY_STRING, UNDEFINED, NULL, ZERO>) {
	const {
		NULL = true as NULL,
		UNDEFINED = true as UNDEFINED,
		EMPTY_STRING = true as EMPTY_STRING,
		ZERO = false as ZERO,
	} = defaultOnTypes;

	return <Props extends T>(props: Props) => {
		const mappedProps = {} as Exclude<
			{
				[K in keyof Props]: Props[K];
			},
			{
				[key: string]:
					| (EMPTY_STRING extends true ? '' : never)
					| (ZERO extends true ? 0 : never)
					| (NULL extends true ? null : never)
					| (UNDEFINED extends true ? undefined : never);
			}
		>;

		Object.entries(props as Record<string, any>).forEach(([key, value]) => {
			if (
				(value === '' && EMPTY_STRING === true) ||
				(value === null && NULL === true) ||
				(typeof value === 'undefined' && UNDEFINED === true) ||
				(value === 0 && ZERO === true)
			) {
				return;
			}
			(mappedProps as Record<string, any>)[key] = value as unknown;
		});

		return { ...defaults, ...mappedProps } as typeof mappedProps & {
			[K in keyof T as K extends keyof typeof mappedProps
				? (typeof mappedProps)[K] extends infer M
					? M extends undefined
						? K
						: never
					: never
				: K]: T[K];
		} & Required<{
				[K in keyof (Defaults | T) as K extends keyof typeof mappedProps
					? (typeof mappedProps)[K] extends infer M
						? M extends undefined
							? K extends keyof T
								? K
								: never
							: never
						: never
					: K]: T[K];
			}>;
	};
}
