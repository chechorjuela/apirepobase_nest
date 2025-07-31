import { PaginationRequestDto } from '../../../../../common/dto/customs/paginator.request.dto';
import { IQuery } from '@nestjs/cqrs';

export class GetAllExampleQuery implements IQuery {
  constructor(public readonly paginationDto?: PaginationRequestDto) {}
}
