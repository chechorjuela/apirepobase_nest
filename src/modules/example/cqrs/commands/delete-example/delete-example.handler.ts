import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DeleteExampleCommand } from './delete-example.command';
import { ExampleEntity } from '../../../entities/example.entity';

@CommandHandler(DeleteExampleCommand)
export class DeleteExampleHandler
  implements ICommandHandler<DeleteExampleCommand>
{
  private readonly logger = new Logger(DeleteExampleHandler.name);

  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async execute(command: DeleteExampleCommand): Promise<void> {
    const { id } = command;

    this.logger.log(`Deleting example with ID: ${id}`);

    try {
      const example = await this.exampleRepository.findOne({
        where: { id: id },
      });

      if (!example) {
        this.logger.warn(`Example with ID ${id} not found`);
        throw new NotFoundException(`Example with ID ${id} not found`);
      }

      await this.exampleRepository.remove(example);

      this.logger.log(`Successfully deleted example with ID: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to delete example with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Failed to delete example');
    }
  }
}
