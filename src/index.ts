import { registerContract, registerFacet } from '@flair-sdk/registry';

import ContractsJson from './contracts.json';
import FacetsJson from './facets.json';

export * from './typechain';

const ContractsManifests = ContractsJson;
const FacetsManifests = FacetsJson;

for (const manifest of Object.values(ContractsManifests)) {
  registerContract(manifest);
}

for (const manifest of Object.values(FacetsManifests)) {
  registerFacet(manifest);
}
