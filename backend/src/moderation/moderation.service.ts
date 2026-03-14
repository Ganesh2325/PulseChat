import { Injectable, Logger } from '@nestjs/common';

const PROFANITY_LIST = [
  'badword1', 'badword2', 'spam', 'scam',
];

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private readonly maxMessageLength = 4000;
  private readonly profanityRegex: RegExp;

  constructor() {
    this.profanityRegex = new RegExp(`\\b(${PROFANITY_LIST.join('|')})\\b`, 'gi');
  }

  validateMessage(content: string): { valid: boolean; reason?: string; filtered?: string } {
    if (!content || content.trim().length === 0) {
      return { valid: false, reason: 'Message cannot be empty' };
    }

    if (content.length > this.maxMessageLength) {
      return { valid: false, reason: `Message exceeds maximum length of ${this.maxMessageLength} characters` };
    }

    const filtered = this.filterProfanity(content);

    return { valid: true, filtered };
  }

  private filterProfanity(content: string): string {
    return content.replace(this.profanityRegex, (match) => '*'.repeat(match.length));
  }

  checkSpamPattern(content: string): boolean {
    const repeatedChars = /(.)\1{20,}/.test(content);
    const allCaps = content.length > 10 && content === content.toUpperCase() && /[A-Z]/.test(content);
    return repeatedChars || allCaps;
  }
}
