import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';

export interface ParseIntPipeOptions {
  min?: number;
  max?: number;
  optional?: boolean;
}

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  private readonly logger = new Logger(CustomParseIntPipe.name);

  constructor(private readonly options: ParseIntPipeOptions = {}) {}

  transform(value: string): number {
    if (
      this.options.optional &&
      (value === undefined || value === null || value === '')
    ) {
      return undefined;
    }

    if (value === undefined || value === null || value === '') {
      throw new BadRequestException('Value is required');
    }

    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      this.logger.warn(`Invalid integer value: ${value}`);
      throw new BadRequestException(`"${value}" is not a valid integer`);
    }

    if (this.options.min !== undefined && parsed < this.options.min) {
      throw new BadRequestException(
        `Value must be at least ${this.options.min}`,
      );
    }

    if (this.options.max !== undefined && parsed > this.options.max) {
      throw new BadRequestException(
        `Value must be at most ${this.options.max}`,
      );
    }

    return parsed;
  }
}
