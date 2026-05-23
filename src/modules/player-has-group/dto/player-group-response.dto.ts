import { S3UrlService } from '../../../common/services/s3-url.service'
import { PlayerRawRow } from '../repositories/player-has-group.repository'

export class PlayerGroupResponseDto {
  id: string
  name: string
  position: string | null
  club: string | null
  avatar: string | null
  played: number
  wins: number
  losses: number
  draws: number
  goals: number
  assists: number
  groupId: string

  static from(row: PlayerRawRow, s3UrlService: S3UrlService): PlayerGroupResponseDto {
    const dto = new PlayerGroupResponseDto()
    dto.id = row.id
    dto.name = row.name
    dto.position = row.position
    dto.club = s3UrlService.buildClubUrl(row.clubName)
    dto.avatar = s3UrlService.buildAvatarUrl(row.id, row.avatarUrl)
    dto.played = row.played
    dto.wins = row.wins
    dto.losses = row.losses
    dto.draws = row.draws
    dto.goals = row.goals
    dto.assists = row.assists
    dto.groupId = row.groupId
    return dto
  }
}
