// @ts-ignore
import * as pkg from '__packagePath__';

export const pluginName = pkg.pluginName || pkg.name;
export const pluginVersion = pkg.version;
export const pluginDescription = pkg.description;
export const pluginId = '__pluginId__';
export const pluginRequiredCoreVersion = pkg.devDependencies['@nwplay/core'];
