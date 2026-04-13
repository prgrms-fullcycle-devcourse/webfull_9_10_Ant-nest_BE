import { Module } from "@nestjs/common";
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { DiaryModule } from "./diary/diary.module";
import { QuestionModule } from "./question/question.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DiaryModule,
    QuestionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}