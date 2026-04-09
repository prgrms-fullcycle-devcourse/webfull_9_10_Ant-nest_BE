import {
  Body,
  Controller,
  Post,
  Req,
  UseFilters,
  HttpStatus,
  HttpCode,
  Get,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { SignupRequestDto } from "./dto/req/signup.request.dto";
import { SignupResponseDto } from "./dto/res/signup.response.dto";
import { ApiCustomResponseDecorator } from "../util/decorators/api-custom-response.decorator";
import CustomResponse from "../common/response/custom-response";
import { CustomUnauthorizedExceptionFilter } from "../common/filters/custom-unauthorized-exception.filter";
import { LoginResponseDto } from "./dto/res/login.response.dto";
import { LoginRequestDto } from "./dto/req/login.request.dto";
import CheckDuplicateEmailResponseDto from "./dto/res/check-duplicate-email.response.dto";
import CheckDuplicateEmailParamsDto from "./dto/req/check-duplicate-email.params.dto";
import CheckDuplicateNicknameResponseDto from "./dto/res/check-duplicate-nickname.response.dto";
import CheckDuplicateNicknameParamsDto from "./dto/req/check-duplicate-nickname.params.dto";

@ApiTags("인증")
@Controller("/auth")
@UseFilters(CustomUnauthorizedExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "회원가입 API",
    description: "사용자 정보를 입력받아 회원가입을 진행합니다.",
  })
  @ApiCustomResponseDecorator(SignupResponseDto)
  @Post()
  async signup(
    @Body() body: SignupRequestDto,
  ): Promise<CustomResponse<SignupResponseDto>> {
    const data: SignupResponseDto = await this.authService.signup(body);

    return new CustomResponse<SignupResponseDto>(data, "회원가입 성공");
  }

  @ApiOperation({
    summary: "로그인 API",
    description:
      "이메일과 비밀번호를 입력받아 로그인을 진행하고 토큰을 발급합니다.",
  })
  @ApiCustomResponseDecorator(LoginResponseDto)
  @HttpCode(HttpStatus.OK)
  @Post("/login")
  async login(
    @Body() body: LoginRequestDto,
  ): Promise<CustomResponse<LoginResponseDto>> {
    const result = await this.authService.login(body);

    return new CustomResponse<LoginResponseDto>(result, "로그인 성공");
  }

  @ApiOperation({
    summary: "이메일 중복 확인 API",
    description: "회원가입 시 이메일 중복 확인을 해줍니다.",
  })
  @ApiCustomResponseDecorator(CheckDuplicateEmailResponseDto)
  @Get("/emails")
  async checkDuplicateEmail(@Query() params: CheckDuplicateEmailParamsDto) {
    const data = await this.authService.checkDuplicateEmail(params);

    return new CustomResponse<CheckDuplicateEmailResponseDto>(
      data,
      "이메일 중복 확인 성공",
    );
  }

  @ApiOperation({
    summary: "닉네임 중복 확인 API",
    description: "회원가입과 닉네임 변경 시 닉네임 중복 확인을 해줍니다.",
  })
  @ApiCustomResponseDecorator(CheckDuplicateNicknameResponseDto)
  @Get("/nicknames")
  async checkDuplicateNickname(
    @Query() params: CheckDuplicateNicknameParamsDto,
  ) {
    const data = await this.authService.checkDuplicateNickname(params);

    return new CustomResponse<CheckDuplicateNicknameResponseDto>(
      data,
      "닉네임 중복 확인 성공",
    );
  }
}
