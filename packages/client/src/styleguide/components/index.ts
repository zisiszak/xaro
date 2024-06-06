import {
	BannerWrap,
	Button,
	ButtonsFlex,
	Description,
	DetailsAndButtonsWrap,
	DetailsWrap,
	Header,
	ImageBanner,
	Title,
} from '../primitives/header.js';
import {
	Form,
	FormCheckboxInput,
	FormDescription,
	FormErrorMessage,
	FormFieldset,
	FormFieldsetLegend,
	FormFilesInput,
	FormInputContainer,
	FormInputLabel,
	FormItemsContainer,
	FormNaviationLink,
	FormNavigationContainer,
	FormPasswordInput,
	FormSelectInput,
	FormSubmitButton,
	FormSuccessMessage,
	FormTextInput,
	FormTitle,
} from './form.js';

export const FormPrimitive = {
	Form: Form,
	Title: FormTitle,
	Fieldset: FormFieldset,
	FieldsetLegend: FormFieldsetLegend,
	Description: FormDescription,
	ItemsContainer: FormItemsContainer,
	navigation: {
		Container: FormNavigationContainer,
		Link: FormNaviationLink,
	},
	item: {
		Container: FormInputContainer,
		Label: FormInputLabel,
		Text: FormTextInput,
		Checkbox: FormCheckboxInput,
		Password: FormPasswordInput,
		Files: FormFilesInput,
		Select: FormSelectInput,
	},
	statusMessage: {
		Error: FormErrorMessage,
		Success: FormSuccessMessage,
	},
	buttons: {
		Submit: FormSubmitButton,
	},
};

export const HeaderPrimitive = {
	Header: Header,
	banner: {
		Wrap: BannerWrap,
		Image: ImageBanner,
	},
	detailsAndButtons: {
		Wrap: DetailsAndButtonsWrap,
		DetailsWrap: DetailsWrap,
		Title: Title,
		Description: Description,
		ButtonsFlex: ButtonsFlex,
		Button: Button,
	},
};
