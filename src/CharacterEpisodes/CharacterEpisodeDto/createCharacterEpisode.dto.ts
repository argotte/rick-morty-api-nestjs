/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CreateCharacterEpisodeDto {
  @ApiProperty({ example: 1, description: 'ID of the character' })
  characterId: number;

  @ApiProperty({ example: 1, description: 'ID of the episode' })
  episodeId: number;

  @ApiProperty({
    example: '11:41',
    description: 'Start time of the episode',
  })
  init: string;

  @ApiProperty({
    example: '11:55',
    description: 'End time of the episode',
  })
  finish: string;
}
