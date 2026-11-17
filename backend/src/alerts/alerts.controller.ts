import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  BadRequestErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { ProjectsService } from '../projects/projects.service.js';
import { AlertEvaluatorService } from './alert-evaluator.service.js';
import { AlertsService } from './alerts.service.js';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto.js';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto.js';
import { AlertRule } from './entities/alert-rule.entity.js';

@ApiTags('alerts')
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
@Controller('projects/:projectId/alerts')
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly evaluatorService: AlertEvaluatorService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Utwórz regułę alertu',
    description:
      'Reguła porównuje metrykę (error rate, p95, liczba żądań) z progiem w oknie czasu. Po przekroczeniu może utworzyć incydent i wysłać webhook.',
  })
  @ApiCreatedResponse({ description: 'Utworzona reguła', type: AlertRule })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateAlertRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.create(projectId, user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista reguł alertów projektu' })
  @ApiOkResponse({
    description: 'Reguły alertów',
    type: AlertRule,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz regułę alertu' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator reguły' })
  @ApiOkResponse({ description: 'Reguła alertu', type: AlertRule })
  @ApiNotFoundResponse({
    description: 'Projekt lub reguła nie istnieje',
    type: NotFoundErrorDto,
  })
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.findOne(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Zaktualizuj regułę alertu',
    description: 'Pola pominięte w body pozostają bez zmian.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator reguły' })
  @ApiOkResponse({ description: 'Zaktualizowana reguła', type: AlertRule })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub reguła nie istnieje',
    type: NotFoundErrorDto,
  })
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlertRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.update(projectId, id, dto);
  }

  @Post(':id/evaluate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Oceń regułę teraz',
    description:
      'Liczy metrykę od razu, bez czekania na harmonogram, i aktualizuje status reguły. Przy przejściu w stan firing działa tak samo jak ocena automatyczna.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator reguły' })
  @ApiOkResponse({ description: 'Reguła po ocenie', type: AlertRule })
  @ApiNotFoundResponse({
    description: 'Projekt lub reguła nie istnieje',
    type: NotFoundErrorDto,
  })
  async evaluate(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    const rule = await this.alertsService.findOne(projectId, id);
    return this.evaluatorService.evaluate(rule);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usuń regułę alertu' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator reguły' })
  @ApiNoContentResponse({ description: 'Reguła usunięta' })
  @ApiNotFoundResponse({
    description: 'Projekt lub reguła nie istnieje',
    type: NotFoundErrorDto,
  })
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.remove(projectId, id);
  }
}
