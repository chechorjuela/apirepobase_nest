import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExampleResponsetDto {
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
}
