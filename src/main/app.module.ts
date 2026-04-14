import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { DiaryModule } from "./diary/diary.module";
import { QuestionModule } from "./question/question.module";
import { SquareService } from "./square/square.service";
import { SquareController } from "./square/square.controller";
import { SquareModule } from "./square/square.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DiaryModule,
    QuestionModule,
    SquareModule,
  ],
  controllers: [SquareController],
  providers: [SquareService],
})
export class AppModule {}
