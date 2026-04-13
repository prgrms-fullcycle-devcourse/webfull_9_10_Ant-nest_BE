import { Module } from "@nestjs/common";
import { QuestionController } from "./question.controller";
import { QuestionService } from "./question.service";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
