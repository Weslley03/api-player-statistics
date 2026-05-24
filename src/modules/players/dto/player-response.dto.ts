import { S3UrlService } from '../../../common/services/s3-url.service'
import { IndividualAwardRawRow } from '../interfaces/individual-award-raw-row.interface'
import { MatchParticipationRawRow } from '../interfaces/match-participation-raw-row.interface'
import { PlayerStatsRawRow } from '../interfaces/player-stats-raw-row.interface'

export class ClubItemDto {
  key: string
  value: string

  static from(clubKey: string, url: string): ClubItemDto {
    const dto = new ClubItemDto()
    dto.key = clubKey
    dto.value = url
    return dto
  }
}

export class IndividualAwardDto {
  key: string
  value: number

  static from(row: IndividualAwardRawRow): IndividualAwardDto {
    const dto = new IndividualAwardDto()
    dto.key = row.key
    dto.value = row.value
    return dto
  }
}

export class MatchParticipationDto {
  matchId: number
  date: string
  homeName: string
  homeScore: number
  awayName: string
  awayScore: number
  team: string
  goals: number
  assists: number
  isMvp: boolean

  static from(row: MatchParticipationRawRow, isMvp: boolean): MatchParticipationDto {
    const dto = new MatchParticipationDto()
    dto.matchId = row.matchId
    dto.date = row.date
    dto.homeName = row.homeName
    dto.homeScore = row.homeScore
    dto.awayName = row.awayName
    dto.awayScore = row.awayScore
    dto.team = row.team
    dto.goals = row.goals
    dto.assists = row.assists
    dto.isMvp = isMvp
    return dto
  }
}

/**
 * expected structure of PlayerResponseDto.
 *
 * ```json
 * [
 *   {
 *     "id": "player-id",
 *     "name": "Weslley",
 *     "position": "MEI",
 *     "club": "https://cdn.example.com/clubs/barcelona.png",
 *     "avatar": "https://cdn.example.com/players/avatar.png",
 *     "played": 10,
 *     "wins": 6,
 *     "losses": 2,
 *     "draws": 2,
 *     "goals": 12,
 *     "assists": 5,
 *     "groupId": "group-id",
 *     "awards": [
 *       {
 *         "key": "best_scorer",
 *         "value": 1
 *       },
 *       {
 *         "key": "best_assist",
 *         "value": 2
 *       }
 *     ],
 *     "matches": [
 *       {
 *         "matchId": 3,
 *         "date": "2026-05-10",
 *         "homeName": "Time A",
 *         "homeScore": 3,
 *         "awayName": "Time B",
 *         "awayScore": 1,
 *         "team": "home",
 *         "goals": 2,
 *         "assists": 1
 *       },
 *       {
 *         "matchId": 2,
 *         "date": "2026-05-03",
 *         "homeName": "Time C",
 *         "homeScore": 1,
 *         "awayName": "Time D",
 *         "awayScore": 1,
 *         "team": "away",
 *         "goals": 0,
 *         "assists": 0
 *       }
 *     ]
 *   }
 * ]
 * ```
 */
export class PlayerResponseDto {
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
  awards: IndividualAwardDto[]
  matches: MatchParticipationDto[]

  static from(row: PlayerStatsRawRow, awards: IndividualAwardDto[], matches: MatchParticipationDto[], s3: S3UrlService): PlayerResponseDto {
    const dto = new PlayerResponseDto()

    dto.id = row.id
    dto.name = row.name
    dto.position = row.position
    dto.club = s3.buildClubUrl(row.clubName)
    dto.avatar = s3.buildAvatarUrl(row.id, row.avatarUrl)
    dto.played = row.played
    dto.wins = row.wins
    dto.losses = row.losses
    dto.draws = row.draws
    dto.goals = row.goals
    dto.assists = row.assists
    dto.groupId = row.groupId
    dto.awards = awards
    dto.matches = matches

    return dto
  }
}
