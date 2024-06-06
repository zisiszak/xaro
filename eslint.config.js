/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

/** @type {import("eslint").Linter.FlatConfig} */
export default [
	{
		ignores: [
			'eslint.config.js',
			'vite.config.ts',
			'chrome-extension/**',
			'build/**',
			'build-test/**',
		],
	},
	{
		ignores: [
			'node_modules/**',
			'build/**',
			'chrome-extension/**',
			'build-test/**',
		],
		plugins: {
			'unused-imports': unusedImports,
		},
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		rules: {
			'unused-imports/no-unused-imports': 'warn',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
			'consistent-type-imports': 'off',
		},
	},
	...compat.config({
		extends: ['plugin:@typescript-eslint/recommended-type-checked'],
		plugins: ['@typescript-eslint'],
		parser: '@typescript-eslint/parser',
		parserOptions: {
			project: false,
			// tsconfigRootDir: __dirname,
		},
		ignorePatterns: [
			'*/node_modules/**',
			'*/build/**',
			'*/build-test/**',
			'*/chrome-extension/**',
		],
		rules: {
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'inline-type-imports',
				},
			],
			'@typescript-eslint/consistent-type-exports': [
				'error',
				{
					fixMixedExportsWithInlineTypeSpecifier: false,
				},
			],
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-misused-promises': 'off',
		},
	}),
	eslintPluginPrettierRecommended,
];
