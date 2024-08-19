/* eslint-disable prettier/prettier */
export class EpisodeDto {
  id: number;
  name: string;
  episodeCode:string;
  air_date: Date;
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