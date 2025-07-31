import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExampleRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the example',
    example: 'Updated Example Name',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Name of the example',
    example: 'Updated Example Name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the example',
    example: 'Updated description of the example',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
