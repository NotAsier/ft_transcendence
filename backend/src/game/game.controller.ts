import { Controller, Post, Get, Param, Body, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  createGame(@Body('player1Id') player1Id: number) {
    return this.gameService.createGame(player1Id);
  }

  @Post('join')
  joinGame(
    @Body('gameId') gameId: number,
    @Body('player2Id') player2Id: number,
  ) {
    return this.gameService.joinGame(gameId, player2Id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/me')
  getHistory(@Request() req: any) {
    console.log('=== [controller] req.user:', req.user);
    return this.gameService.getHistory(req.user.userId);
  }

  @Get(':id')
  getGameState(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.getGameState(id);
  }

  @Post(':id/move')
  makeMove(
    @Param('id', ParseIntPipe) id: number,
    @Body('playerId') playerId: number,
    @Body('position') position: number,
  ) {
    return this.gameService.makeMove(id, playerId, position);
  }
}
