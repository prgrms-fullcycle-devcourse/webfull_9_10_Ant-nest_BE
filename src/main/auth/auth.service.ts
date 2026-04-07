import {
  Injectable,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";

import {
  SignupRequestDto,
} from "./dto/req/signup.request.dto";
import {
  SignupResponseDto,
} from "./dto/res/signup.response.dto";
import PasswordMismatchException from "../common/exception/password-mismatch.exception"
import DuplicateEmailException from "../common/exception/duplicate-email.exception"
import DuplicateNicknameException from "../common/exception/duplicate-nickname.exception"
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {
  }

  // 회원가입 로직
  async signup(body: SignupRequestDto): Promise<SignupResponseDto> {

    // 1. 비밀번호 일치 확인
    if (body.password !== body.checkPassword) {
      throw new PasswordMismatchException();
    }

    // 2. 이메일 중복 확인
    const existingEmail = await this.prisma.member.findUnique({
      where: {
        email: body.email,
      },
    });
    if (existingEmail) {
      throw new DuplicateEmailException();
    }

    // 3. 닉네임 중복 확인
    const existingNickname = await this.prisma.member.findUnique({
      where: {
        nickname: body.nickname,
      },
    });
    if (existingNickname) {
      throw new DuplicateNicknameException();
    }

    // 4. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // 5. 사용자 생성
    const member = await this.prisma.member.create({
      data: {
        email: body.email,
        nickname: body.nickname,
        password: hashedPassword,
      },
    });

    return new SignupResponseDto(
      member.id.toString(),
    );
  }
}