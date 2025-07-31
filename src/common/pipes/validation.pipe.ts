import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Type } from '@nestjs/common';

interface ValidationPipeOptions {
  metatype?: Type<unknown>;
}

interface FormattedError {
  property: string;
  value?: unknown;
  constraints?: { [type: string]: string };
  children?: FormattedError[];
}

@Injectable()
export class CustomValidationPipe implements PipeTransform<any, Promise<any>> {
  private readonly logger = new Logger(CustomValidationPipe.name);

  async transform(
    value: unknown,
    { metatype }: ValidationPipeOptions,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors: ValidationError[] = await validate(object as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      dismissDefaultMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      this.logger.warn(
        'Validation failed',
        JSON.stringify(formattedErrors, null, 2),
      );
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Type<unknown>): boolean {
    const types: Type<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): FormattedError[] {
    return errors.map<FormattedError>((error) => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length
        ? this.formatErrors(error.children)
        : undefined,
    }));
  }
}
