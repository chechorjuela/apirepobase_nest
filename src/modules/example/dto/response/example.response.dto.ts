import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExampleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the example',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Name of the example',
    example: 'My Example',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the example',
    example: 'A detailed description of the example',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-12-01T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-12-01T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDateString()
  updatedAt: Date;
}
