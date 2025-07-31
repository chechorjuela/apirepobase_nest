import { ObjectLiteral } from 'typeorm';

export interface IRepository<T extends ObjectLiteral> {
  findById(id: string | number): Promise<T | null>;
  findAll(): Promise<T[]>;
  findBy(criteria: Partial<T>): Promise<T[]>;
  findOneBy(criteria: Partial<T>): Promise<T | null>;
  create(entity: Partial<T>): Promise<T>;
  update(id: string | number, entity: Partial<T>): Promise<T>;
  delete(id: string | number): Promise<void>;
  count(): Promise<number>;
  exists(id: string | number): Promise<boolean>;
}
