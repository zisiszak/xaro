import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const iconsDir = path.resolve(`${fileURLToPath}/../src/assets/icons`);
const iconsIndex = path.join(iconsDir, 'index.ts');

const svgFiles = fs
	.readdirSync(iconsDir)
	.filter((file) => file.endsWith('.svg'));

const lines = svgFiles.map((file) => {
	const componentName = file
		.slice(0, file.indexOf('_wght'))
		.replace(/_([A-z0-9])/g, (str) => str[1].toUpperCase())
		.replace(/^[0-9]/, (str) => `_${str}`)
		.replace(/^[\w]/, (str) => str.toUpperCase());
	return `export { default as ${componentName} } from './${file}?react';`;
});

fs.writeFileSync(
	iconsIndex,
	`// Path: ${path.relative(path.resolve(__dirname, '..'), iconsIndex)}
// THIS FILE IS AUTOGENERATED. DO NOT MODIFY IT MANUALLY.

${lines.join('\n')}`,
);