import { IQuery } from '@nestjs/cqrs';

export class GetByIdExampleQuery implements IQuery {
  constructor(public readonly id: number) {}
}
