import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetByIdExampleQuery } from './get-by-example.query';

@QueryHandler(GetByIdExampleQuery)
export class GetByExampleHandlerHandler
  implements IQueryHandler<GetByIdExampleQuery>
{
  execute(query: GetByIdExampleQuery): Promise<{
    id: number;
    username: string;
    email: string;
  }> {
    const { id } = query;
    // Example: fetch user by ID
    // return await this.userRepository.findById(userId);
    return Promise.resolve({
      id: id,
      username: 'example',
      email: 'user@example.com',
    });
  }
}
