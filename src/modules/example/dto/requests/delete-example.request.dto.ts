import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteExampleRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the example',
    example: 'Updated Example Name',
  })
  @IsString()
  @IsOptional()
  Id?: string;
}
