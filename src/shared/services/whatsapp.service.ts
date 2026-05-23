import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Twilio from 'twilio'

export interface InvitationMessageContext {
  to: string
  rawPassword: string
  managerName: string
  groupName: string
  groupCode: string
}

export interface ManagerWelcomeContext {
  to: string
  rawPassword: string
  managerName: string
  groupName: string
  groupCode: string
}

export interface GroupAddedNotificationContext {
  to: string
  playerName: string
  managerName: string
  groupName: string
  groupCode: string
}

export interface ManagerNewGroupContext {
  to: string
  managerName: string
  groupName: string
  groupCode: string
}

@Injectable()
export class WhatsAppService {
  private readonly client: Twilio.Twilio
  private readonly from: string
  private readonly appUrl: string
  private readonly logger = new Logger(WhatsAppService.name)

  constructor(configService: ConfigService) {
    const accountSid = configService.getOrThrow<string>('TWILIO_ACCOUNT_SID')
    const apiKeySid = configService.getOrThrow<string>('TWILIO_API_KEY_SID')
    const apiKeySecret = configService.getOrThrow<string>('TWILIO_API_KEY_SECRET')
    this.from = configService.getOrThrow<string>('TWILIO_WHATSAPP_FROM')
    this.appUrl = configService.getOrThrow<string>('APP_URL')
    this.client = Twilio(apiKeySid, apiKeySecret, { accountSid })
  }

  async sendInvitation(ctx: InvitationMessageContext): Promise<void> {
    const toWhatsApp = ctx.to.startsWith('whatsapp:') ? ctx.to : `whatsapp:${ctx.to}`

    const loginLink = `${this.appUrl}/login?phone=${ctx.to}&password=${ctx.rawPassword}&groupCode=${ctx.groupCode}`

    const body = [
      `🏆 *Plataforma de Estatísticas de Atletas*`,
      ``,
      `Olá! Você foi convidado por *${ctx.managerName}* a participar do grupo *${ctx.groupName}*.`,
      ``,
      `Nossa plataforma classifica e ranqueia os atletas do grupo com base em partidas, gols, assistências e desempenho geral. Acompanhe sua evolução e dispute o topo do ranking!`,
      ``,
      `👉 Acesse direto pelo link (dados já preenchidos):`,
      loginLink,
      ``,
      `Ou acesse manualmente em:`,
      `🔗 ${this.appUrl}`,
      `🔑 Senha provisória: *${ctx.rawPassword}*`,
      ``,
      `⚠️ No primeiro acesso você será solicitado a criar uma nova senha.`,
    ].join('\n')

    try {
      await this.client.messages.create({ from: this.from, to: toWhatsApp, body })
    } catch (err) {
      this.logger.error(`Failed to send WhatsApp invitation to ${ctx.to}`, err)
      throw err
    }
  }

  async sendGroupAddedNotification(ctx: GroupAddedNotificationContext): Promise<void> {
    const toWhatsApp = ctx.to.startsWith('whatsapp:') ? ctx.to : `whatsapp:${ctx.to}`

    const body = [
      `🏆 *Plataforma de Estatísticas de Atletas*`,
      ``,
      `Olá, *${ctx.playerName}*!`,
      ``,
      `Você foi adicionado ao grupo *${ctx.groupName}* pelo gestor *${ctx.managerName}*.`,
      ``,
      `Acesse a plataforma normalmente com seu número e senha já cadastrados.`,
      `🔗 ${this.appUrl}`,
    ].join('\n')

    try {
      await this.client.messages.create({ from: this.from, to: toWhatsApp, body })
    } catch (err) {
      this.logger.error(`Failed to send group added notification to ${ctx.to}`, err)
      throw err
    }
  }

  async sendManagerNewGroupNotification(ctx: ManagerNewGroupContext): Promise<void> {
    const toWhatsApp = ctx.to.startsWith('whatsapp:') ? ctx.to : `whatsapp:${ctx.to}`

    const body = [
      `🏆 *Plataforma de Estatísticas de Atletas*`,
      ``,
      `Olá, *${ctx.managerName}*!`,
      ``,
      `Seu novo grupo *${ctx.groupName}* foi criado com sucesso.`,
      ``,
      `Acesse a plataforma normalmente com seu número e senha já cadastrados.`,
      `🔗 ${this.appUrl}`,
    ].join('\n')

    try {
      await this.client.messages.create({ from: this.from, to: toWhatsApp, body })
    } catch (err) {
      this.logger.error(`Failed to send manager new group notification to ${ctx.to}`, err)
      throw err
    }
  }

  async sendManagerWelcome(ctx: ManagerWelcomeContext): Promise<void> {
    const toWhatsApp = ctx.to.startsWith('whatsapp:') ? ctx.to : `whatsapp:${ctx.to}`

    const loginLink = `${this.appUrl}/login?phone=${ctx.to}&password=${ctx.rawPassword}&groupCode=${ctx.groupCode}`

    const body = [
      `🏆 *Plataforma de Estatísticas de Atletas*`,
      ``,
      `Olá, *${ctx.managerName}*! Sua conta de administrador foi criada com sucesso.`,
      ``,
      `Você é o gestor do grupo *${ctx.groupName}* e tem acesso completo para registrar partidas, convidar jogadores e acompanhar as estatísticas do seu grupo.`,
      ``,
      `👉 Acesse sua conta direto pelo link (dados já preenchidos):`,
      loginLink,
      ``,
      `Ou acesse manualmente em:`,
      `🔗 ${this.appUrl}`,
      `🔑 Senha provisória: *${ctx.rawPassword}*`,
      ``,
      `⚠️ No primeiro acesso você será solicitado a criar uma nova senha.`,
    ].join('\n')

    try {
      await this.client.messages.create({ from: this.from, to: toWhatsApp, body })
    } catch (err) {
      this.logger.error(`Failed to send WhatsApp manager welcome to ${ctx.to}`, err)
      throw err
    }
  }
}
