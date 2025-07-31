import { IRepository } from '../../../common/repositories/interfaces/IRepository';
import { ExampleEntity } from '../entities/example.entity';

export interface IExampleRepository extends IRepository<ExampleEntity> {
  findByName(name: string): Promise<ExampleEntity[]>;
  findByNameContaining(namePattern: string): Promise<ExampleEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ExampleEntity[]>;
  findWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    data: ExampleEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
