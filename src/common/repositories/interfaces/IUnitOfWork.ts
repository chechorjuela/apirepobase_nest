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
}
