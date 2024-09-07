export type UserRole = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];
export const UserRoleEnum = {
	Admin: 1,
	Standard: 2,
} as const;

const userRolesSet: Set<UserRole> = new Set(Object.values(UserRoleEnum));

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const isUserRole = (value: unknown): value is UserRole => userRolesSet.has(value as any);
export function assertUserRole(value: UserRole): asserts value is UserRole {
	if (!isUserRole(value)) throw 'value is not a UserRole';
}
