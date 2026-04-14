import { Module } from '@nestjs/common';
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { SquareController } from "./square.controller";
import { SquareService } from "./square.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SquareController],
  providers: [SquareService],
  exports: [SquareService],
})
export class SquareModule {}
