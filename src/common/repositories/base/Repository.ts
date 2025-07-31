import {
  Repository as TypeOrmRepository,
  EntityManager,
  FindOptionsWhere,
  DeepPartial,
  ObjectLiteral,
} from 'typeorm';
import { IRepository } from '../interfaces/IRepository';

export abstract class Repository<T extends ObjectLiteral>
  implements IRepository<T>
{
  protected constructor(
    protected readonly repository: TypeOrmRepository<T>,
    protected readonly manager?: EntityManager,
  ) {}

  async findById(id: string | number): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async findBy(criteria: Partial<T>): Promise<T[]> {
    return await this.repository.find({
      where: criteria as FindOptionsWhere<T>,
    });
  }

  async findOneBy(criteria: Partial<T>): Promise<T | null> {
    return await this.repository.findOne({
      where: criteria as FindOptionsWhere<T>,
    });
  }

  async create(entity: Partial<T>): Promise<T> {
    const newEntity = this.repository.create(entity as DeepPartial<T>);
    return await this.repository.save(newEntity);
  }

  async update(id: string | number, entity: Partial<T>): Promise<T> {
    await this.repository.update(id, entity as any);
    const updatedEntity = await this.findById(id);
    if (!updatedEntity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return updatedEntity;
  }

  async delete(id: string | number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Entity with id ${id} not found`);
    }
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async exists(id: string | number): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  // Database command execution methods
  async executeQuery<R = any>(query: string, parameters?: any[]): Promise<R[]> {
    const entityManager = this.manager || this.repository.manager;
    return await entityManager.query(query, parameters);
  }

  async executeStoredProcedure<R = any>(
    procedureName: string,
    parameters?: any[],
  ): Promise<R[]> {
    const entityManager = this.manager || this.repository.manager;
    const paramPlaceholders = parameters
      ? parameters.map((_, index) => `$${index + 1}`).join(', ')
      : '';
    const query = `CALL ${procedureName}(${paramPlaceholders})`;
    return await entityManager.query(query, parameters);
  }

  async executeFunction<R = any>(
    functionName: string,
    parameters?: any[],
  ): Promise<R> {
    const entityManager = this.manager || this.repository.manager;
    const paramPlaceholders = parameters
      ? parameters.map((_, index) => `$${index + 1}`).join(', ')
      : '';
    const query = `SELECT ${functionName}(${paramPlaceholders}) as result`;
    const result = await entityManager.query(query, parameters);
    return result[0]?.result as R;
  }

  async executeView<R = any>(
    viewName: string,
    conditions?: Record<string, any>,
  ): Promise<R[]> {
    const entityManager = this.manager || this.repository.manager;
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

    return await entityManager.query(query, parameters);
  }

  async executeRawQuery<R = any>(
    query: string,
    parameters?: any[],
  ): Promise<R> {
    const entityManager = this.manager || this.repository.manager;
    return await entityManager.query(query, parameters);
  }
}
