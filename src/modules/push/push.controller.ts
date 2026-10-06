import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PushEndpointDto,
  PushSubscriptionDto,
} from '../users/dto/push-subscription.dto';
import { UsersService } from '../users/users.service';
import { PushDeviceType } from '../users/types/push-device.type';
import { describePushDevice } from '../users/utils/push-device';
import { PushService } from './push.service';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(
    private readonly pushService: PushService,
    private readonly usersService: UsersService,
  ) {}

  @Get('push-subscription/status')
  getStatus(@CurrentUser() user: JwtUser) {
    return this.pushService.getStatus(user.userId);
  }

  @Post('push-subscription')
  subscribe(
    @CurrentUser() user: JwtUser,
    @Body() dto: PushSubscriptionDto,
    @Req() request: Request,
  ) {
    const userAgent = request.get('user-agent') ?? '';
    const hint = request.get('x-push-device-type');
    const deviceType = Object.values(PushDeviceType).find(
      (type) => type === hint,
    );
    return this.usersService.addPushSubscription(
      user.userId,
      dto,
      userAgent || deviceType
        ? describePushDevice(userAgent, deviceType)
        : undefined,
    );
  }

  @Post('push-subscription/test')
  test(@CurrentUser() user: JwtUser, @Body() dto: PushEndpointDto) {
    return this.pushService.sendTestNotification(user.userId, dto.endpoint);
  }

  @Delete('push-subscription')
  unsubscribe(@CurrentUser() user: JwtUser, @Body() dto: PushEndpointDto) {
    return this.usersService.removePushSubscription(user.userId, dto.endpoint);
  }
}
