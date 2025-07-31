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

  // Database command execution methods
  async executeQuery<R = any>(query: string, parameters?: any[]): Promise<R[]> {
    return await this.manager.query(query, parameters);
  }

  async executeStoredProcedure<R = any>(
    procedureName: string,
    parameters?: any[],
  ): Promise<R[]> {
    const paramPlaceholders = parameters
      ? parameters.map((_, index) => `$${index + 1}`).join(', ')
      : '';
    const query = `CALL ${procedureName}(${paramPlaceholders})`;
    return await this.manager.query(query, parameters);
  }

  async executeFunction<R = any>(
    functionName: string,
    parameters?: any[],
  ): Promise<R> {
    const paramPlaceholders = parameters
      ? parameters.map((_, index) => `$${index + 1}`).join(', ')
      : '';
    const query = `SELECT ${functionName}(${paramPlaceholders}) as result`;
    const result = await this.manager.query(query, parameters);
    return result[0]?.result as R;
  }

  async executeView<R = any>(
    viewName: string,
    conditions?: Record<string, any>,
  ): Promise<R[]> {
    let query = `SELECT * FROM ${viewName}`;
    const parameters: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => {
          parameters.push(conditions[key]);
          return `${key} = $${index + 1}`;
        })
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    return await this.manager.query(query, parameters);
  }

  async executeRawQuery<R = any>(
    query: string,
    parameters?: any[],
  ): Promise<R> {
    return await this.manager.query(query, parameters);
  }

  async executeTrigger<R = any>(
    triggerOperation: string,
    tableName: string,
    data?: any,
  ): Promise<R> {
    // This method helps execute operations that will trigger database triggers
    // The actual trigger execution is automatic when the operation occurs
    switch (triggerOperation.toUpperCase()) {
      case 'INSERT': {
        if (!data) {
          throw new Error('Data is required for INSERT operation');
        }
        const insertColumns = Object.keys(data).join(', ');
        const insertValues = Object.keys(data)
          .map((_, index) => `$${index + 1}`)
          .join(', ');
        const insertQuery = `INSERT INTO ${tableName} (${insertColumns}) VALUES (${insertValues}) RETURNING *`;
        return await this.manager.query(insertQuery, Object.values(data));
      }
      case 'UPDATE': {
        if (!data || !data.id) {
          throw new Error('Data with id is required for UPDATE operation');
        }
        const { id, ...updateData } = data;
        const updateSet = Object.keys(updateData)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(', ');
        const updateQuery = `UPDATE ${tableName} SET ${updateSet} WHERE id = $${Object.keys(updateData).length + 1} RETURNING *`;
        return await this.manager.query(updateQuery, [
          ...Object.values(updateData),
          id,
        ]);
      }
      case 'DELETE': {
        if (!data || !data.id) {
          throw new Error('Data with id is required for DELETE operation');
        }
        const deleteQuery = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
        return await this.manager.query(deleteQuery, [data.id]);
      }
      default:
        throw new Error(`Unsupported trigger operation: ${triggerOperation}`);
    }
  }

  async executeBatch<R = any>(
    queries: Array<{ query: string; parameters?: any[] }>,
  ): Promise<R[]> {
    const results: R[] = [];

    // Execute all queries within the same transaction context
    for (const { query, parameters } of queries) {
      const result = await this.manager.query(query, parameters);
      results.push(result);
    }

    return results;
  }

  // Enhanced method for executing operations within a transaction with database commands
  async withTransactionAndCommands<T>(
    operation: (uow: IUnitOfWork) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Create a temporary UnitOfWork instance for this transaction
    const transactionalUoW = new UnitOfWork(this.dataSource);
    (transactionalUoW as any)._queryRunner = queryRunner;

    try {
      const result = await operation(transactionalUoW);
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
