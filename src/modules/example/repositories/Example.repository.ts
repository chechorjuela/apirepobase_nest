import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository as TypeOrmRepository,
  EntityManager,
  Like,
  Between,
} from 'typeorm';
import { Repository } from '../../../common/repositories/base/Repository';
import { IExampleRepository } from './IExample.repository';
import { ExampleEntity } from '../entities/example.entity';

@Injectable()
export class ExampleRepository
  extends Repository<ExampleEntity>
  implements IExampleRepository
{
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: TypeOrmRepository<ExampleEntity>,
    manager?: EntityManager,
  ) {
    super(exampleRepository, manager);
  }

  async findByName(name: string): Promise<ExampleEntity[]> {
    return await this.repository.find({
      where: { name },
    });
  }

  async findByNameContaining(namePattern: string): Promise<ExampleEntity[]> {
    return await this.repository.find({
      where: { name: Like(`%${namePattern}%`) },
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<ExampleEntity[]> {
    return await this.repository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    data: ExampleEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Security: Enforce safe limits and page numbers
    const safeLimit = Math.min(Math.max(limit, 1), 100); // Max 100 items per page
    const safePage = Math.max(page, 1); // Minimum page 1
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await this.repository.findAndCount({
      skip,
      take: safeLimit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  // Override create method to add custom logic if needed
  async create(entity: Partial<ExampleEntity>): Promise<ExampleEntity> {
    const newEntity = this.repository.create({
      ...entity,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.repository.save(newEntity);
  }

  // Override update method to add custom logic if needed
  async update(
    id: string | number,
    entity: Partial<ExampleEntity>,
  ): Promise<ExampleEntity> {
    await this.repository.update(id, {
      ...entity,
      updatedAt: new Date(),
    });

    const updatedEntity = await this.findById(id);
    if (!updatedEntity) {
      throw new Error(`Example with id ${id} not found`);
    }
    return updatedEntity;
  }
}
