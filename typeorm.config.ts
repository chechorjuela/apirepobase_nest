// TypeORM CLI configuration file
// This file imports and re-exports the existing database configuration
// for use with TypeORM CLI commands

import { AppDataSource } from './src/config/database/database.config';

export default AppDataSource;
