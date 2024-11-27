import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
	js.configs.recommended,
	prettier,
	eslintPluginUnicorn.configs['flat/recommended'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				google: 'readonly',
				gtag: 'readonly',
			},
		},
		rules: {
			// its broken
			'unicorn/expiring-todo-comments': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-await-expression-member': 'off',
			'unicorn/no-null': 'off',
			'unicorn/filename-case': 'off',
			'unicorn/prevent-abbreviations': [
				'error',
				{
					allowList: {
						// arguments is often an illegal variable name
						args: true,
						$$Props: true,
						Props: true,
						props: true,
						i: true,
						src: true,
						ref: true,
						Ref: true,
					},
				},
			],
			eqeqeq: 'error',
			'func-style': ['error', 'expression', { allowArrowFunctions: true }],
			yoda: 'error',
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
		},
	},
];
