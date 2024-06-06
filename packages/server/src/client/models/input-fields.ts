export const inputFieldKinds = [
	'text',
	'number',
	'selection',
	'toggle',
] as const;
export type InputFieldKind = (typeof inputFieldKinds)[number];

export type MappedInputFieldValueType = {
	text: string;
	number: number;
	selection: string;
	toggle: boolean;
};

export interface SelectionInputFieldOption {
	default?: boolean;
	value: string;
	name: string;
}

interface InputFieldBase<
	Kind extends InputFieldKind,
	ValueType extends
		MappedInputFieldValueType[Kind] = MappedInputFieldValueType[Kind],
> {
	kind: Kind;
	defaultValue?: ValueType;
	required?: boolean;
	validator?: (input: unknown) => boolean | string;
}

export interface TextInputField extends InputFieldBase<'text'> {}
export interface NumberInputField extends InputFieldBase<'number'> {
	round?: boolean;
	max?: number;
	min?: number;
}
export interface SelectionInputField<Selection extends string = string>
	extends InputFieldBase<'selection', Selection> {
	defaultValue?: undefined;
	options: SelectionInputFieldOption[];
}
export interface ToggleInputField extends InputFieldBase<'toggle'> {}

export type InputField =
	| TextInputField
	| NumberInputField
	| SelectionInputField
	| ToggleInputField;
export type MappedInputField<Kind extends InputFieldKind> = Extract<
	InputField,
	InputFieldBase<Kind>
>;

export type InputFieldsConfiguration<
	Kind extends InputFieldKind = InputFieldKind,
> = {
	name: string;
	description?: string;
	fields: MappedInputField<Kind>[];
};
