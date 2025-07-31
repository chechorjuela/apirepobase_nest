import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { IUnitOfWork } from './interfaces/IUnitOfWork';

@Injectable()
export class UnitOfWork implements IUnitOfWork {
  private _queryRunner?: QueryRunner;
  private _manager: EntityManager;

  constructor(private readonly dataSource: DataSource) {
    this._manager = this.dataSource.manager;
  }

  get manager(): EntityManager {
    return this._queryRunner?.manager || this._manager;
  }

  get queryRunner(): QueryRunner | undefined {
    return this._queryRunner;
  }

  async startTransaction(): Promise<void> {
    if (this._queryRunner) {
      throw new Error('Transaction already started');
    }

    this._queryRunner = this.dataSource.createQueryRunner();
    await this._queryRunner.connect();
    await this._queryRunner.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    if (!this._queryRunner) {
      throw new Error('No transaction started');
    }

    await this._queryRunner.commitTransaction();
  }

  async rollbackTransaction(): Promise<void> {
    if (!this._queryRunner) {
      throw new Error('No transaction started');
    }

    await this._queryRunner.rollbackTransaction();
  }

  async release(): Promise<void> {
    if (this._queryRunner) {
      await this._queryRunner.release();
      this._queryRunner = undefined;
    }
  }

  async withTransaction<T>(
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
