import { ICommand } from '@nestjs/cqrs';
import { CreateExampleRequestDto } from '../../../dto';

export class CreateExampleCommand implements ICommand {
  constructor(public readonly createExampleDto: CreateExampleRequestDto) {}
}
