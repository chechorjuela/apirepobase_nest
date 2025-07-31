import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExampleCommand } from './create-example.command';
import { ExampleResponsetDto } from '../../../dto';
import { ExampleEntity } from '../../../entities/example.entity';

@CommandHandler(CreateExampleCommand)
export class CreateExampleHandler
  implements ICommandHandler<CreateExampleCommand>
{
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
  ) {}

  async execute(command: CreateExampleCommand): Promise<ExampleResponsetDto> {
    const { createExampleDto } = command;

    const example = this.exampleRepository.create({
      name: createExampleDto.name,
      description: createExampleDto.description,
    });

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
