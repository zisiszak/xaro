import { newError } from 'exitus';
import { type Guard } from 'is-guard';
import { type Insertable } from 'kysely';

interface InsertValueParser<Schema, Raw = Insertable<Schema>> {
	<V extends Raw extends Insertable<Schema> ? Insertable<Schema> : Raw>(
		value: V | V[],
	): Insertable<Schema>[];
	<V extends Raw extends Insertable<Schema> ? Insertable<Schema> : Raw>(
		value: V,
		...values: V[]
	): Insertable<Schema>[];
}

interface InsertionValueParserConfig<Schema, Raw = Insertable<Schema>> {
	guard?: Guard<Raw>;
	parser: Raw extends Insertable<Schema> ? null : (original: Raw) => Insertable<Schema>;
}
export function createInsertionValueParser<Schema, Raw = Insertable<Schema>>({
	guard,
	parser,
}: InsertionValueParserConfig<Schema, Raw>) {
	const prepareValue = (
		value: Raw extends Insertable<Schema> ? Insertable<Schema> : Raw,
	): Insertable<Schema> => {
		if (guard && !guard(value)) {
			throw newError({ message: "Insert value doesn't match expected type." });
		}
		if (parser !== null) {
			return parser(value as Raw);
		}
		return value as Insertable<Schema>;
	};

	const valueParser: InsertValueParser<Schema, Raw> = (valueOrValues, ...values: any[]) => {
		if (Array.isArray(valueOrValues)) {
			return valueOrValues.map(prepareValue);
		} else if (Array.isArray(values)) {
			const arr = [prepareValue(valueOrValues)];
			arr.push(...values.map(prepareValue));
			return arr;
		} else {
			return [prepareValue(valueOrValues)];
		}
	};

	return valueParser;
}
