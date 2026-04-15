import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { DiaryModule } from "./diary/diary.module";
import { QuestionModule } from "./question/question.module";
import { SquareService } from "./square/square.service";
import { SquareController } from "./square/square.controller";
import { SquareModule } from "./square/square.module";
import { MemberService } from './member/member.service';
import { MemberController } from './member/member.controller';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DiaryModule,
    QuestionModule,
    SquareModule,
    MemberModule,
  ],
  controllers: [SquareController, MemberController],
  providers: [SquareService, MemberService],
})
export class AppModule {}
