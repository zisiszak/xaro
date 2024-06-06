import { db } from '../../index.js';
import { errorOutcome } from '../../utils/outcomes.js';

export async function isPluginEnabled(plugin: string): Promise<boolean> {
	return db
		.selectFrom('Plugin')
		.select(['isEnabled'])
		.where((eb) => eb.and([eb('name', '=', plugin)]))
		.executeTakeFirst()
		.then((result) => {
			if (!result) {
				return Promise.reject(
					errorOutcome({
						message: 'Plugin name not found in database.',
						context: {
							plugin: plugin,
						},
					}),
				);
			}

			return result.isEnabled === 1 ? true : false;
		});
}

export async function throwIfPluginNotEnabled(plugin: string): Promise<void> {
	if (!(await isPluginEnabled(plugin))) {
		return Promise.reject(
			errorOutcome({
				message: 'Plugin is not enabled.',
				context: {
					plugin: plugin,
				},
			}),
		);
	}
}
