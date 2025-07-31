import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExampleEntity } from '../../../entities/example.entity';
import { ExampleResponsetDto } from '../../../dto';
import { GetAllExampleQuery } from './get-all-example.query';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetAllExampleQuery)
export class GetAllExampleHandler implements IQueryHandler<GetAllExampleQuery> {
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async execute(
    query: GetAllExampleQuery,
  ): Promise<PaginatedResponse<ExampleResponsetDto>> {
    const { paginationDto } = query;

    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    const [examples, total] = await this.exampleRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const data = examples.map((example) => ({
      id: example.id,
      name: example.name,
      description: example.description,
      createdAt: example.createdAt,
      updatedAt: example.updatedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
