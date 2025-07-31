import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateExampleCommand } from './update-example.command';
import { ExampleEntity } from '../../../entities/example.entity';
import { ExampleResponsetDto } from '../../../dto';

@CommandHandler(UpdateExampleCommand)
export class UpdateExampleHandler
  implements ICommandHandler<UpdateExampleCommand>
{
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async execute(command: UpdateExampleCommand): Promise<ExampleResponsetDto> {
    const { id, updateExampleDto } = command;

    const example = await this.exampleRepository.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    if (updateExampleDto.name !== undefined) {
      example.name = updateExampleDto.name;
    }
    if (updateExampleDto.description !== undefined) {
      example.description = updateExampleDto.description;
    }

    const savedExample = await this.exampleRepository.save(example);

    return Promise.resolve({
      id: savedExample.id,
      name: savedExample.name,
      description: savedExample.description,
      createdAt: savedExample.createdAt,
      updatedAt: savedExample.updatedAt,
    });
  }
}
