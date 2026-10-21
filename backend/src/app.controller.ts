import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /** GET / is a quick way to check that the backend is running. */
  @Get()
  getStatus(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
