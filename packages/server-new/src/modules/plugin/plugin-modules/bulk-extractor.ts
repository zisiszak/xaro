import { type LoadedPluginModuleInfo, type PluginModuleInfo } from './shared.js';

export interface BulkExtractorFunctionProps {}

export type BulkExtractorFunction = (props: BulkExtractorFunctionProps) => Promise<unknown>;

export interface BulkExtractorFeatures {}

export interface BulkExtractor<F extends BulkExtractorFeatures>
	extends PluginModuleInfo<'bulk-extractor'> {
	features: F;
}

export type LoadedBulkExtractor = BulkExtractor<any> & LoadedPluginModuleInfo<'bulk-extractor'>;
