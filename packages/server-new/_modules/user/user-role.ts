export type UserRole = (typeof userRoles)[number];

export const userRoles = ['standard', 'admin'] as const;

export const isUserRole = (value: unknown): value is UserRole =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	userRoles.includes(value as any);

export function assertIsUserRole(value: UserRole): asserts value is UserRole {
	if (!isUserRole(value)) throw 'BAD: user role';
}
