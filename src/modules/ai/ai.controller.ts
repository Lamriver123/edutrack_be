import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiScheduleService } from './ai-schedule.service';
import { AiChatDto } from './dto/ai-chat.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiScheduleService: AiScheduleService) {}

  @Post('schedule-suggest')
  createSession(@CurrentUser() user: JwtUser) {
    return this.aiScheduleService.createSession(user.userId);
  }

  @Post('schedule-suggest/chat')
  chat(@CurrentUser() user: JwtUser, @Body() dto: AiChatDto) {
    return this.aiScheduleService.chat(user.userId, dto.sessionId, dto.message);
  }

  @Get('schedule-suggest/sessions')
  listSessions(@CurrentUser() user: JwtUser) {
    return this.aiScheduleService.listSessions(user.userId);
  }

  @Get('schedule-suggest/sessions/:sessionId')
  getSession(
    @CurrentUser() user: JwtUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.aiScheduleService.getSession(user.userId, sessionId);
  }
}
