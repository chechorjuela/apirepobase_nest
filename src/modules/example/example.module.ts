import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ExampleController } from './controller/example.controller';
import { ExampleRepositoryController } from './controller/example-repository.controller';
import { ExampleEntity } from './entities/example.entity';
import { CreateExampleHandler } from './cqrs/commands/create-example/create-example.handler';
import { UpdateExampleHandler } from './cqrs/commands/update-example/update-example.handler';
import { DeleteExampleHandler } from './cqrs/commands/delete-example/delete-example.handler';
import { GetAllExampleHandler } from './cqrs';
import { GetByExampleHandlerHandler } from './cqrs/queries/get-by-id/get-by-example.handler';
import { AutomapperService } from './mappers';
import { ExampleRepository } from './repositories';
import { UnitOfWork } from '../../common/repositories';
import { ExampleService } from './services/example.service';

// Command Handlers

// Query Handlers

const CommandHandlers = [
  CreateExampleHandler,
  UpdateExampleHandler,
  DeleteExampleHandler,
];

const QueryHandlers = [GetAllExampleHandler, GetByExampleHandlerHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ExampleEntity]),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
  ],
  controllers: [ExampleController, ExampleRepositoryController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    AutomapperService,
    ExampleRepository,
    {
      provide: 'IExampleRepository',
      useClass: ExampleRepository,
    },
    UnitOfWork,
    {
      provide: 'IUnitOfWork',
      useClass: UnitOfWork,
    },
    ExampleService,
  ],
  exports: [TypeOrmModule],
})
export class ExampleModule {}
