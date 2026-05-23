import { Body, Controller, Post } from '@nestjs/common'
import { Created } from '../../common/decorators/api-response.decorator'
import { SellPlanDto } from './dto/sell-plan.dto'
import { PlansService, SellPlanResult } from './plans.service'

@Controller('/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('/sell')
  @Created()
  sell(@Body() dto: SellPlanDto): Promise<SellPlanResult> {
    return this.plansService.sell(dto)
  }
}
