import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import baseConfig from '../../eslint.config.js';

/** @type {import("eslint").Linter.FlatConfig} */
export default [
	{
		plugins: {
			'react-refresh': reactRefresh,
			'react-hooks': reactHooks,
		},
		rules: {
			'react-refresh/only-export-components': [
				'error',
				{ allowConstantExport: true },
			],
		},
		ignores: ['node_modules', 'build'],
		files: ['**/*.tsx'],
	},
	...baseConfig,
];
