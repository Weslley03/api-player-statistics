import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class S3UrlService {
  constructor(private readonly configService: ConfigService) {}

  buildUrl(key: string): string {
    const bucket = this.configService.get<string>('S3_BUCKET')
    const region = this.configService.get<string>('AWS_REGION')
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  }

  buildClubUrl(clubName: string | null): string | null {
    return clubName ? this.buildUrl(`club/${clubName}.svg`) : null
  }

  buildAvatarUrl(playerId: string, avatarUrl: string | null): string | null {
    return avatarUrl ? this.buildUrl(`user-avatar/${playerId}.png`) : null
  }
}
