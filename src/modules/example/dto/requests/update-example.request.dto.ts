import {
  IsString,
  IsOptional,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExampleRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the example',
    example: 'Updated Example Name',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_.]+$/, {
    message:
      'Name can only contain letters, numbers, spaces, hyphens, underscores, and dots',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the example',
    example: 'Updated description of the example',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;
}
