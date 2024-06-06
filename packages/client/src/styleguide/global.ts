import { createGlobalStyle } from 'styled-components';
import { colour } from './colour.js';
import { factorCssString } from './factor.js';

export const GlobalStyles = createGlobalStyle`
:root {
    ${factorCssString}
}

html {
    background-color: ${colour.background.main};
    color: ${colour.text.main};
}

p {
    color: ${colour.text.main75};
}
`;
