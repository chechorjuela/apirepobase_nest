import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GetByIdExampleQuery } from './get-by-example.query';
import { ExampleEntity } from '../../../entities/example.entity';
import { ExampleResponseDto } from '../../../dto';

@QueryHandler(GetByIdExampleQuery)
export class GetByExampleHandlerHandler
  implements IQueryHandler<GetByIdExampleQuery>
{
  private readonly logger = new Logger(GetByExampleHandlerHandler.name);

  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async execute(query: GetByIdExampleQuery): Promise<ExampleResponseDto> {
    const { id } = query;

    this.logger.log(`Retrieving example with ID: ${id}`);

    try {
      const example = await this.exampleRepository.findOne({
        where: { id: id },
      });

      if (!example) {
        this.logger.warn(`Example with ID ${id} not found`);
        throw new NotFoundException(`Example with ID ${id} not found`);
      }

      this.logger.log(`Successfully retrieved example with ID: ${id}`);

      return {
        id: example.id,
        name: example.name,
        description: example.description,
        createdAt: example.createdAt,
        updatedAt: example.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to retrieve example with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Failed to retrieve example');
    }
  }
}
