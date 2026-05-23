export interface PlayerStatsRawRow {
  id: string
  name: string
  position: string | null
  clubName: string | null
  avatarUrl: string | null
  played: number
  wins: number
  losses: number
  draws: number
  goals: number
  assists: number
  groupId: string
}
