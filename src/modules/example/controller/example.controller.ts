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
  Logger,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../../common/security/guards';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateExampleRequestDto,
  ExampleResponseDto,
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
@Public()
@UseGuards(ThrottlerGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ExampleController {
  private readonly logger = new Logger(ExampleController.name);

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
  ): Promise<ExampleResponseDto> {
    this.logger.warn(
      `🔓 PUBLIC API USAGE: Creating example with name: ${createExampleDto.name}`,
    );

    const result = await this.commandBus.execute(
      new CreateExampleCommand(createExampleDto),
    );

    return this.mapper.map(result, ExampleEntity, ExampleResponseDto);
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
  ): Promise<ExampleResponseDto[]> {
    this.logger.log(
      `🔓 PUBLIC API USAGE: Retrieving examples - Page: ${paginationDto.page || 1}, Limit: ${paginationDto.limit || 10}`,
    );

    const result = await this.queryBus.execute(
      new GetAllExampleQuery(paginationDto),
    );

    return Array.isArray(result)
      ? result.map((item) =>
          this.mapper.map(item, ExampleEntity, ExampleResponseDto),
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
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExampleResponseDto> {
    const result = await this.queryBus.execute(new GetByIdExampleQuery(id));

    return this.mapper.map(result, ExampleEntity, ExampleResponseDto);
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExampleDto: UpdateExampleRequestDto,
  ): Promise<ExampleResponseDto> {
    const command = { ...updateExampleDto, id };
    const result = await this.commandBus.execute(command);

    return this.mapper.map(result, ExampleEntity, ExampleResponseDto);
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
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteExampleCommand(id));
  }
}
