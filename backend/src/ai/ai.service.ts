import { Injectable, Logger } from '@nestjs/common';

export interface AiProvider {
  improve(text: string): Promise<string>;
  rewrite(text: string): Promise<string>;
  summarize(text: string): Promise<string>;
  translate(text: string, targetLanguage: string): Promise<string>;
}

class MockAiProvider implements AiProvider {
  async improve(text: string): Promise<string> {
    let improved = text.charAt(0).toUpperCase() + text.slice(1);
    if (!improved.endsWith('.') && !improved.endsWith('!') && !improved.endsWith('?')) {
      improved += '.';
    }
    improved = improved.replace(/\s+/g, ' ').trim();
    return improved;
  }

  async rewrite(text: string): Promise<string> {
    const words = text.split(' ');
    const prefix = words.length > 5
      ? 'In other words, '
      : 'Put simply, ';
    return prefix + text.toLowerCase();
  }

  async summarize(text: string): Promise<string> {
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    if (sentences.length <= 1) return text;
    return sentences[0].trim() + '.';
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    return `[${targetLanguage.toUpperCase()}] ${text}`;
  }
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;

  constructor() {
    this.provider = new MockAiProvider();
    this.logger.log('AI service initialized with MockAiProvider');
  }

  async process(text: string, action: 'improve' | 'rewrite' | 'summarize' | 'translate', targetLanguage?: string) {
    this.logger.debug(`Processing AI action: ${action}`);

    let result: string;
    switch (action) {
      case 'improve':
        result = await this.provider.improve(text);
        break;
      case 'rewrite':
        result = await this.provider.rewrite(text);
        break;
      case 'summarize':
        result = await this.provider.summarize(text);
        break;
      case 'translate':
        result = await this.provider.translate(text, targetLanguage || 'es');
        break;
      default:
        result = text;
    }

    return { original: text, result, action };
  }
}
