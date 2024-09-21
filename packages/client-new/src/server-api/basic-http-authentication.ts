export function basicHttpAuthentication(
	username: string,
	password?: string | null,
): Readonly<{
	Authorization: string;
}> {
	return { Authorization: `Basic ${btoa(`${username}:${password ?? ''}`)}` };
}
