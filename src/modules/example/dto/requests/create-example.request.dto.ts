import {
  IsString,
  IsOptional,
  IsNotEmpty,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExampleRequestDto {
  @ApiProperty({
    description: 'Name of the example',
    example: 'My Example',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_.]+$/, {
    message:
      'Name can only contain letters, numbers, spaces, hyphens, underscores, and dots',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the example',
    example: 'A detailed description of the example',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;
}
