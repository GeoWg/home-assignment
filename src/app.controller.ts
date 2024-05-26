import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('reset')
  @HttpCode(200)
  async resetAccounts() {
    this.appService.reset();
    return 'OK';
  }

  @Get('balance')
  async getAccountBalance(@Query('account_id') id: string, @Res() res) {
    const account = await this.appService.findAccountById(id);
    if (!account) {
      return res.status(404).send('0');
    }
    return res.send(account.balance.toString());
  }

  @Post('event')
  async sendEvent(@Body() body, @Res() res) {
    const event = await this.appService.sendEvent(body);
    if (!event) {
      return res.status(404).send('0');
    }
    return res.send(event);
  }
}
