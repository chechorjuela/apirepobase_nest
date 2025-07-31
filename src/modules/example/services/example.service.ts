import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IExampleRepository } from '../repositories/IExample.repository';
import { IUnitOfWork } from '../../../common/repositories/interfaces/IUnitOfWork';
import { ExampleEntity } from '../entities/example.entity';
import { CreateExampleRequestDto } from '../dto/requests/create-example.request.dto';
import { UpdateExampleRequestDto } from '../dto/requests/update-example.request.dto';

@Injectable()
export class ExampleService {
  constructor(
    @Inject('IExampleRepository')
    private readonly exampleRepository: IExampleRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async createExample(
    createDto: CreateExampleRequestDto,
  ): Promise<ExampleEntity> {
    return await this.exampleRepository.create(createDto);
  }

  async updateExample(
    id: string,
    updateDto: UpdateExampleRequestDto,
  ): Promise<ExampleEntity> {
    const existingExample = await this.exampleRepository.findById(id);
    if (!existingExample) {
      throw new NotFoundException(`Example with id ${id} not found`);
    }

    return await this.exampleRepository.update(id, updateDto);
  }

  async deleteExample(id: string): Promise<void> {
    const existingExample = await this.exampleRepository.findById(id);
    if (!existingExample) {
      throw new NotFoundException(`Example with id ${id} not found`);
    }

    await this.exampleRepository.delete(id);
  }

  async findById(id: string): Promise<ExampleEntity> {
    const example = await this.exampleRepository.findById(id);
    if (!example) {
      throw new NotFoundException(`Example with id ${id} not found`);
    }

    return example;
  }

  async findAll(): Promise<ExampleEntity[]> {
    return await this.exampleRepository.findAll();
  }

  async findByName(name: string): Promise<ExampleEntity[]> {
    return await this.exampleRepository.findByName(name);
  }

  async findWithPagination(page: number = 1, limit: number = 10) {
    return await this.exampleRepository.findWithPagination(page, limit);
  }

  async searchByName(namePattern: string): Promise<ExampleEntity[]> {
    return await this.exampleRepository.findByNameContaining(namePattern);
  }

  // Example of using UnitOfWork for complex operations
  async createMultipleExamples(
    examples: CreateExampleRequestDto[],
  ): Promise<ExampleEntity[]> {
    return await this.unitOfWork.withTransaction(async () => {
      const results: ExampleEntity[] = [];

      for (const exampleDto of examples) {
        const newExample = await this.exampleRepository.create(exampleDto);
        results.push(newExample);
      }

      return results;
    });
  }

  // Example of using UnitOfWork for operations that might need rollback
  async updateExampleWithValidation(
    id: string,
    updateDto: UpdateExampleRequestDto,
  ): Promise<ExampleEntity> {
    return await this.unitOfWork.withTransaction(async () => {
      const existingExample = await this.exampleRepository.findById(id);
      if (!existingExample) {
        throw new NotFoundException(`Example with id ${id} not found`);
      }

      // Check if name already exists (business rule example)
      if (updateDto.name && updateDto.name !== existingExample.name) {
        const duplicateExample = await this.exampleRepository.findOneBy({
          name: updateDto.name,
        });
        if (duplicateExample) {
          throw new Error(
            `Example with name '${updateDto.name}' already exists`,
          );
        }
      }

      return await this.exampleRepository.update(id, updateDto);
    });
  }

  // Example of manual transaction management
  async complexOperation(
    id: string,
    updateDto: UpdateExampleRequestDto,
  ): Promise<ExampleEntity> {
    await this.unitOfWork.startTransaction();

    try {
      const example = await this.exampleRepository.findById(id);
      if (!example) {
        throw new NotFoundException(`Example with id ${id} not found`);
      }

      const updatedExample = await this.exampleRepository.update(id, updateDto);

      // Simulate some other operations that might fail
      // await this.someOtherService.doSomething(updatedExample);

      await this.unitOfWork.commitTransaction();
      return updatedExample;
    } catch (error) {
      await this.unitOfWork.rollbackTransaction();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
