import { ICommand } from '@nestjs/cqrs';
import { UpdateExampleRequestDto } from '../../../dto';

export class UpdateExampleCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly updateExampleDto: UpdateExampleRequestDto,
  ) {}
}
