export interface GroupContext {
  id: string
  code: string
  description: string
  role: string
  isManager: boolean
}

export interface LoginResult {
  player: { id: string; name: string; phoneNumber: string; position: string | null; avatarUrl: string | null; club: string | null }
  groups: GroupContext[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenPayload {
  sub: string
  groupId: string
  jti: string
  type: 'refresh'
}
