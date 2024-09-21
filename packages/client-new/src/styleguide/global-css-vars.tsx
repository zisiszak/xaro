// import { useInsertionEffect } from 'react';

// interface GlobalCssVars {
// 	[key: string]: string;
// }

// export const GlobalCssVars = ({ vars }: { vars: GlobalCssVars }) => {
// 	useInsertionEffect(() => {
// 		const varsAsString = Object.entries(vars)
// 			.map(([name, value]) => `${name}:${value};`)
// 			.join('\n');

// 		const styleNode = document.createElement('style');
// 		styleNode.id = 'global-css-vars';
// 		styleNode.textContent = `
//             :root {
//                 ${varsAsString}
//             }
//         `;
// 		document.head.append(styleNode);

// 		return () => styleNode.remove();
// 	}, [vars]);

// 	return null;
// };
