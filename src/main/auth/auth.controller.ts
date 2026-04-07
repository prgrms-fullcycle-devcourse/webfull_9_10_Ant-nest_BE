import {
  Body,
  Controller,
  Post,
  Req,
  UseFilters,
  HttpStatus,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { SignupRequestDto } from "./dto/req/signup.request.dto";
import { SignupResponseDto } from "./dto/res/signup.response.dto";
import { ApiCustomResponseDecorator } from "../util/decorators/api-custom-response.decorator";
import CustomResponse from "../common/response/custom-response";
import { CustomUnauthorizedExceptionFilter } from "../common/filters/custom-unauthorized-exception.filter";

@ApiTags("인증")
@Controller("auth")
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
}
