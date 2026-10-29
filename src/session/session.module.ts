import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [CommonModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
