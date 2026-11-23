import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  BadRequestErrorDto,
  NotFoundErrorDto,
  ServiceUnavailableErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { ProjectsService } from '../projects/projects.service.js';
import { SendChatMessageDto } from './dto/send-chat-message.dto.js';
import { IncidentChatMessage } from './entities/incident-chat-message.entity.js';
import { IncidentChatService } from './incident-chat.service.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('analysis')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@ApiParam({
  name: 'projectId',
  format: 'uuid',
  description: 'Identyfikator projektu',
})
@ApiParam({
  name: 'incidentId',
  format: 'uuid',
  description: 'Identyfikator incydentu',
})
@Controller('projects/:projectId/incidents/:incidentId/chat')
export class IncidentChatController {
  constructor(
    private readonly chatService: IncidentChatService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Historia czatu o incydencie' })
  @ApiOkResponse({
    description: 'Wiadomości w kolejności chronologicznej',
    type: IncidentChatMessage,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async findMessages(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('incidentId', ParseIdPipe) incidentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.chatService.findMessages(projectId, incidentId);
  }

  @Post()
  @ApiOperation({
    summary: 'Zadaj pytanie o incydent',
    description:
      'AI odpowiada na podstawie dowodów incydentu i wcześniejszej rozmowy, w języku pytania.',
  })
  @ApiCreatedResponse({
    description: 'Pytanie użytkownika i odpowiedź asystenta',
    type: IncidentChatMessage,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Asystent AI jest niedostępny (kod AI_UNAVAILABLE)',
    type: ServiceUnavailableErrorDto,
  })
  async ask(
    @Param('projectId', ParseIdPipe) projectId: string,
    @Param('incidentId', ParseIdPipe) incidentId: string,
    @Body() dto: SendChatMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.chatService.ask(projectId, incidentId, user.sub, dto);
  }
}
