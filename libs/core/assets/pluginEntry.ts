// @ts-ignore
import * as pkg from '__packagePath__';

export const pluginName = pkg.pluginName || pkg.name;
export const pluginVersion = pkg.version;
export const pluginDescription = pkg.description;
export const pluginId = '__pluginId__';
export const pluginMinCoreVersion = pkg.devDependencies['@nwplay/core'];
// @ts-ignore
export const pluginBuildDate = __date__;
export const pluginBuildRev = '__gitRev__';
export const pluginUrl = '__pluginUrl__';
