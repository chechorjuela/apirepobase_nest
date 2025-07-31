import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteExampleCommand } from './delete-example.command';

@CommandHandler(DeleteExampleCommand)
export class DeleteExampleHandler
  implements ICommandHandler<DeleteExampleCommand>
{
  async execute(command: DeleteExampleCommand): Promise<{ id: number }> {
    return Promise.resolve({
      id: command.id,
    });
  }
}
