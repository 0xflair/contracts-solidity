import { HardhatUserConfig } from 'hardhat/config';

import baseConfig from './hardhat.config';

const config: HardhatUserConfig = {
  ...baseConfig,
  paths: {
    sources: './contracts/misc/openzeppelin',
  },
};

export default config;
