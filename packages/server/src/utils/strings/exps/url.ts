/**
 * No `#` allowed
 */
export const URL_WITHOUT_HASH = /^([\w\d\-\._~:/?[\]@!$&'()*%+,;=])+$/;
export const URL_CHARS_REQUIRING_ESCAPING =
	/((?<!\\)\\(?!\\))|([\._~:/?[\]@!\-$&'()*%+,;=])/g;
export const URL_PROTOCOL = /^(http(s?)\:\/\/)?((www\.)?)/;
