export interface MatchRawRow {
  matchId: number
  date: string
  groupId: string
  homeName: string
  homeScore: number
  awayName: string
  awayScore: number
  playerId: string
  playerName: string
  playerPosition: string | null
  playerAvatarUrl: string | null
  team: string
  goals: number
  assists: number
  mvpPlayerId: string | null
  mvpPlayerName: string | null
  mvpAvatarUrl: string | null
}
