import { createMap, Mapper } from '@automapper/core';
import { ExampleEntity } from '../entities/example.entity';
import { CreateExampleRequestDto } from '../dto/requests/create-example.request.dto';
import { UpdateExampleRequestDto } from '../dto/requests/update-example.request.dto';
import { ExampleResponseDto } from '../dto/response/example.response.dto';

export function setupExampleMappers(mapper: Mapper): void {
  createMap(mapper, CreateExampleRequestDto, ExampleEntity);

  createMap(mapper, UpdateExampleRequestDto, ExampleEntity);

  createMap(mapper, ExampleEntity, ExampleResponseDto);
}
