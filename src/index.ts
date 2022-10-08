import { registerContract, registerFacet } from '@flair-sdk/registry';

import ContractsJson from './contracts.json';
import FacetsJson from './facets.json';
import InterfacesJson from './interfaces.json';

export * from './typechain';

export const ContractsManifests = ContractsJson;
export const FacetsManifests = FacetsJson;
export const InterfacesDictionary = InterfacesJson;

for (const manifest of Object.values(ContractsManifests)) {
  registerContract(manifest);
}

for (const manifest of Object.values(FacetsManifests)) {
  registerFacet(manifest);
}
