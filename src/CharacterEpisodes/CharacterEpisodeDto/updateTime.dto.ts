/* eslint-disable prettier/prettier */
import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTimeDto {
  @ApiProperty({
    description: 'Start time in the format "mm:ss"',
    example: '01:30',
  })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Init must be in the format "mm:ss"' })
  init: string;

  @ApiProperty({
    description: 'End time in the format "mm:ss"',
    example: '02:45',
  })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Finish must be in the format "mm:ss"' })
  finish: string;
}
