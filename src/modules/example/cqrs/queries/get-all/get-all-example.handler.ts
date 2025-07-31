import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { ExampleEntity } from '../../../entities/example.entity';
import { ExampleResponseDto } from '../../../dto';
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
  private readonly logger = new Logger(GetAllExampleHandler.name);

  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async execute(
    query: GetAllExampleQuery,
  ): Promise<PaginatedResponse<ExampleResponseDto>> {
    const { paginationDto } = query;

    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    this.logger.log(`Retrieving examples - Page: ${page}, Limit: ${limit}`);

    try {
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

      this.logger.log(`Successfully retrieved ${data.length} examples`);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve examples: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Failed to retrieve examples');
    }
  }
}
