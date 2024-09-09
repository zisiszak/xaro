export interface ThumbnailPreset {
	label: string;
	longEdge: number;
}

export const defaultThumbnailPreset: ThumbnailPreset = {
	label: 'thumbDefault',
	longEdge: 1280,
};
