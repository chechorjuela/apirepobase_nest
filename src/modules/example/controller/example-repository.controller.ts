import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { IExampleRepository } from '../repositories/IExample.repository';
import { IUnitOfWork } from '../../../common/repositories/interfaces/IUnitOfWork';
import { CreateExampleRequestDto } from '../dto/requests/create-example.request.dto';
import { UpdateExampleRequestDto } from '../dto/requests/update-example.request.dto';
import { ExampleService } from '../services/example.service';

@ApiTags('Examples Repository Demo')
@Controller('examples-repo')
export class ExampleRepositoryController {
  constructor(
    @Inject('IExampleRepository')
    private readonly exampleRepository: IExampleRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    private readonly exampleService: ExampleService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all examples using repository directly' })
  async findAll() {
    return await this.exampleRepository.findAll();
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated examples' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.exampleRepository.findWithPagination(page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search examples by name pattern' })
  @ApiQuery({ name: 'name', required: true, type: String })
  async searchByName(@Query('name') name: string) {
    return await this.exampleRepository.findByNameContaining(name);
  }

  @Get('service/all')
  @ApiOperation({ summary: 'Get all examples using service' })
  async findAllWithService() {
    return await this.exampleService.findAll();
  }

  @Post('service')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create example using service' })
  async createWithService(@Body() createDto: CreateExampleRequestDto) {
    return await this.exampleService.createExample(createDto);
  }

  @Post('service/multiple')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple examples with transaction' })
  async createMultiple(@Body() createDtos: CreateExampleRequestDto[]) {
    return await this.exampleService.createMultipleExamples(createDtos);
  }

  @Put('service/:id/validated')
  @ApiOperation({ summary: 'Update example with validation using transaction' })
  @ApiParam({ name: 'id', description: 'Example ID' })
  async updateWithValidation(
    @Param('id') id: string,
    @Body() updateDto: UpdateExampleRequestDto,
  ) {
    return await this.exampleService.updateExampleWithValidation(id, updateDto);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total count of examples' })
  async getCount() {
    const count = await this.exampleRepository.count();
    return { count };
  }

  @Get(':id/exists')
  @ApiOperation({ summary: 'Check if example exists' })
  @ApiParam({ name: 'id', description: 'Example ID' })
  async checkExists(@Param('id') id: string) {
    const exists = await this.exampleRepository.exists(id);
    return { exists };
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Find examples by exact name' })
  @ApiParam({ name: 'name', description: 'Example name' })
  async findByName(@Param('name') name: string) {
    return await this.exampleRepository.findByName(name);
  }
}
