import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('process')
  async process(@Body() data: { text: string; action: 'improve' | 'rewrite' | 'summarize' | 'translate'; targetLanguage?: string }) {
    return this.aiService.process(data.text, data.action, data.targetLanguage);
  }
}
