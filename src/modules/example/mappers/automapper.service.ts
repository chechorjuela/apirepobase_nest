import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { setupExampleMappers } from './automapper.setup';

@Injectable()
export class AutomapperService implements OnModuleInit {
  constructor(@InjectMapper() private readonly mapper: Mapper) {}

  onModuleInit() {
    setupExampleMappers(this.mapper);
  }
}
