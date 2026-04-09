import { Request } from "express";

export interface JwtPayload {
  sub: string;
  email: string;
  nickname: string;
}

export interface AuthenticatedRequest extends Request {
  member: {
    id: string;
    email: string;
    nickname: string;
  };
}
