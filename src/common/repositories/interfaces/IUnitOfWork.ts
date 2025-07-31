import { EntityManager, QueryRunner } from 'typeorm';

export interface IUnitOfWork {
  readonly manager: EntityManager;
  readonly queryRunner?: QueryRunner;

  startTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  release(): Promise<void>;

  withTransaction<T>(
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T>;

  // Database command execution methods
  executeQuery<R = any>(query: string, parameters?: any[]): Promise<R[]>;
  executeStoredProcedure<R = any>(
    procedureName: string,
    parameters?: any[],
  ): Promise<R[]>;
  executeFunction<R = any>(
    functionName: string,
    parameters?: any[],
  ): Promise<R>;
  executeView<R = any>(
    viewName: string,
    conditions?: Record<string, any>,
  ): Promise<R[]>;
  executeRawQuery<R = any>(query: string, parameters?: any[]): Promise<R>;
  executeTrigger<R = any>(
    triggerOperation: string,
    tableName: string,
    data?: any,
  ): Promise<R>;
  executeBatch<R = any>(
    queries: Array<{ query: string; parameters?: any[] }>,
  ): Promise<R[]>;
}
