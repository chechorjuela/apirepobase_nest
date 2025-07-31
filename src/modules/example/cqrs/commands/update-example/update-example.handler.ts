import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UpdateExampleCommand } from './update-example.command';
import { ExampleEntity } from '../../../entities/example.entity';
import { ExampleResponseDto } from '../../../dto';

@CommandHandler(UpdateExampleCommand)
export class UpdateExampleHandler
  implements ICommandHandler<UpdateExampleCommand>
{
  private readonly logger = new Logger(UpdateExampleHandler.name);

  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async execute(command: UpdateExampleCommand): Promise<ExampleResponseDto> {
    const { id, updateExampleDto } = command;

    this.logger.log(`Updating example with ID: ${id}`);

    try {
      const example = await this.exampleRepository.findOne({ where: { id } });

      if (!example) {
        this.logger.warn(`Example with ID ${id} not found`);
        throw new NotFoundException(`Example with ID ${id} not found`);
      }

      // Check for name conflicts if name is being updated
      if (updateExampleDto.name && updateExampleDto.name !== example.name) {
        const existingExample = await this.exampleRepository.findOne({
          where: { name: updateExampleDto.name },
        });

        if (existingExample && existingExample.id !== id) {
          this.logger.warn(
            `Example with name '${updateExampleDto.name}' already exists`,
          );
          throw new BadRequestException(
            `Example with name '${updateExampleDto.name}' already exists`,
          );
        }
      }

      // Update fields if provided
      if (updateExampleDto.name !== undefined) {
        example.name = updateExampleDto.name;
      }
      if (updateExampleDto.description !== undefined) {
        example.description = updateExampleDto.description;
      }

      const savedExample = await this.exampleRepository.save(example);

      this.logger.log(
        `Successfully updated example with ID: ${savedExample.id}`,
      );

      return {
        id: savedExample.id,
        name: savedExample.name,
        description: savedExample.description,
        createdAt: savedExample.createdAt,
        updatedAt: savedExample.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update example with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Failed to update example');
    }
  }
}
