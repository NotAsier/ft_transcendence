import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return this.userService.getMe(req.user.userId);
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
  return this.userService.getAll();
}
}