import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): string {
    return '✅ HTTP OK - Server is Running!';
  }
}
