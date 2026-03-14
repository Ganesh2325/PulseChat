import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'PulseChat API is Live',
      status: 'success',
      documentation: 'https://github.com/Ganesh2325/PulseChat',
      timestamp: new Date().toISOString(),
    };
  }
}
