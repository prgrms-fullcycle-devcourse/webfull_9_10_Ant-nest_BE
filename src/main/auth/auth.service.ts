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
import { LoginRequestDto } from "./dto/req/login.request.dto";
import { LoginResponseDto } from "./dto/res/login.response.dto";
import { JwtService } from "@nestjs/jwt";
import EmailNotFoundException from "../common/exception/email-not-found.exception";
import InvalidPasswordException from "../common/exception/invalid-password.exception";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
              private readonly jwtService: JwtService,) {
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

  // 로그인 로직
  async login(body: LoginRequestDto): Promise<LoginResponseDto> {

    // 1. 이메일로 회원 조회
    const member = await this.prisma.member.findUnique({
      where: {
        email: body.email,
      }
    });

    // 2. 회원이 존재하지 않으면 404
    if(!member) {
      throw new EmailNotFoundException();
    }

    // 3. 비밀번호 검증
    const isPasswordMatching = await bcrypt.compare(
      body.password,
      member.password,
    )

    // 4. 비밀번호가 틀리면 401
    if(!isPasswordMatching) {
      throw new InvalidPasswordException();
    }

    // 5. JWT 페이로드 구성
    const payload = {
      sub: member.id.toString(),
      email: member.email,
      nickname: member.nickname,
    };

    // 6. 토큰 생성 및 DTO 반환
    return new LoginResponseDto(
      member.id.toString(),
      member.nickname,
      this.jwtService.sign(payload),
    )
  }
}