/* eslint-disable prettier/prettier */
export class EpisodeDto {
  id: number;
  name: string;
  air_date: Date;
  episode: string;
  status: string;
  duration: number;
  season: string;
}

// model Episode {
//   id          Int                @id
//   name        String
//   airDate     DateTime?
//   episodeCode String?
//   statusId    Int?
//   status      Status?            @relation(fields: [statusId], references: [id])
//   duration    Int?
//   episodes    CharacterEpisodes[]
// }