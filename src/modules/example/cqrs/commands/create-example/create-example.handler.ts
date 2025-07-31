import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateExampleCommand } from './create-example.command';
import { ExampleResponseDto } from '../../../dto';
import { ExampleEntity } from '../../../entities/example.entity';

@CommandHandler(CreateExampleCommand)
export class CreateExampleHandler
  implements ICommandHandler<CreateExampleCommand>
{
  private readonly logger = new Logger(CreateExampleHandler.name);

  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async execute(command: CreateExampleCommand): Promise<ExampleResponseDto> {
    const { createExampleDto } = command;

    this.logger.log(`Creating new example with name: ${createExampleDto.name}`);

    try {
      // Check for duplicate names if required
      const existingExample = await this.exampleRepository.findOne({
        where: { name: createExampleDto.name },
      });

      if (existingExample) {
        this.logger.warn(
          `Example with name '${createExampleDto.name}' already exists`,
        );
        throw new BadRequestException(
          `Example with name '${createExampleDto.name}' already exists`,
        );
      }

      const example = this.exampleRepository.create({
        name: createExampleDto.name,
        description: createExampleDto.description,
      });

      const savedExample = await this.exampleRepository.save(example);

      this.logger.log(
        `Successfully created example with ID: ${savedExample.id}`,
      );

      return {
        id: savedExample.id,
        name: savedExample.name,
        description: savedExample.description,
        createdAt: savedExample.createdAt,
        updatedAt: savedExample.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to create example: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Failed to create example');
    }
  }
}
