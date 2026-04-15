import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
