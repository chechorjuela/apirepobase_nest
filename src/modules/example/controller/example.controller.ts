import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateExampleRequestDto,
  ExampleResponsetDto,
  UpdateExampleRequestDto,
} from '../dto';
import {
  CreateExampleCommand,
  DeleteExampleCommand,
  GetByIdExampleQuery,
  GetAllExampleQuery,
} from '../cqrs';
import { PaginationRequestDto } from '../../../common/dto/customs/paginator.request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ExampleEntity } from '../entities/example.entity';

@ApiTags('Examples')
@Controller('examples')
export class ExampleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new example' })
  @ApiResponse({
    status: 201,
    description: 'ExampleEntity created successfully',
    type: ApiResponseDto,
  })
  async create(
    @Body() createExampleDto: CreateExampleRequestDto,
  ): Promise<ExampleResponsetDto> {
    const result = await this.commandBus.execute(
      new CreateExampleCommand(createExampleDto),
    );

    return this.mapper.map(result, ExampleEntity, ExampleResponsetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all examples with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of examples retrieved successfully',
    type: ApiResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationRequestDto,
  ): Promise<ExampleResponsetDto[]> {
    const result = await this.queryBus.execute(
      new GetAllExampleQuery(paginationDto),
    );

    return Array.isArray(result)
      ? result.map((item) =>
          this.mapper.map(item, ExampleEntity, ExampleResponsetDto),
        )
      : result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an example by ID' })
  @ApiParam({ name: 'id', description: 'ExampleEntity ID' })
  @ApiResponse({
    status: 200,
    description: 'ExampleEntity retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'ExampleEntity not found' })
  async findOne(@Param('id') id: string): Promise<ExampleResponsetDto> {
    const result = await this.queryBus.execute(
      new GetByIdExampleQuery(parseInt(id)),
    );

    return this.mapper.map(result, ExampleEntity, ExampleResponsetDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an example' })
  @ApiParam({ name: 'id', description: 'ExampleEntity ID' })
  @ApiResponse({
    status: 200,
    description: 'ExampleEntity updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'ExampleEntity not found' })
  async update(
    @Param('id') id: string,
    @Body() updateExampleDto: UpdateExampleRequestDto,
  ): Promise<ExampleResponsetDto> {
    const command = { ...updateExampleDto, id };
    const result = await this.commandBus.execute(command);

    return this.mapper.map(result, ExampleEntity, ExampleResponsetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // Changed to 200 to return response body
  @ApiOperation({ summary: 'Delete an example' })
  @ApiParam({ name: 'id', description: 'ExampleEntity ID' })
  @ApiResponse({
    status: 200,
    description: 'ExampleEntity deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'ExampleEntity not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteExampleCommand(parseInt(id)));
  }
}
