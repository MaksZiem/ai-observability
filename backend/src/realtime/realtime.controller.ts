import {
  Controller,
  MessageEvent,
  Param,
  Query,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ProjectEventType } from './project-event.js';
import { RealtimeService } from './realtime.service.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('realtime')
@Public()
@Controller('projects/:projectId/stream')
export class RealtimeController {
  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly projectsService: ProjectsService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse()
  @ApiOperation({
    summary: 'Strumień zdarzeń projektu',
    description: `Server-Sent Events z nowymi danymi projektu. Typy zdarzeń: ${Object.values(ProjectEventType).join(', ')}. Połączenie otwiera się przez EventSource z tokenem z POST /api/auth/stream-token.`,
  })
  @ApiParam({
    name: 'projectId',
    format: 'uuid',
    description: 'Identyfikator projektu',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token z POST /api/auth/stream-token',
  })
  @ApiProduces('text/event-stream')
  @ApiOkResponse({
    description: 'Strumień zdarzeń w formacie text/event-stream',
    schema: { type: 'string' },
  })
  @ApiUnauthorizedResponse({
    description:
      'Brak tokenu, token nieprawidłowy lub to nie jest token strumienia',
    type: UnauthorizedErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  async stream(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Query('token') token: string | undefined,
  ): Promise<Observable<MessageEvent>> {
    const payload = await this.verifyStreamToken(token);
    await this.projectsService.findOne(projectId, payload.sub);
    return this.realtimeService.stream(projectId);
  }

  private async verifyStreamToken(
    token: string | undefined,
  ): Promise<JwtPayload> {
    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }

    if (payload.type !== 'stream') {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
