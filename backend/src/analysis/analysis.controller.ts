import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { AnalysisService } from './analysis.service.js';
import { RequestAnalysisDto } from './dto/request-analysis.dto.js';
import { IncidentAnalysis } from './entities/incident-analysis.entity.js';

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
@Controller('projects/:projectId/incidents/:incidentId/analyses')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Zleć analizę incydentu przez AI',
    description:
      'Tworzy analizę w statusie pending i liczy ją w tle na podstawie dowodów incydentu. Koniec jest ogłaszany w strumieniu zdarzeń (analysis.finished). Wynik oddziela fakty od hipotez.',
  })
  @ApiAcceptedResponse({
    description: 'Analiza przyjęta do przetworzenia',
    type: IncidentAnalysis,
  })
  @ApiBadRequestResponse({
    description: 'Nieobsługiwany język',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async request(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestAnalysisDto,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.analysisService.request(
      projectId,
      incidentId,
      user.sub,
      dto.language ?? 'en',
    );
  }

  @Get()
  @ApiOperation({ summary: 'Historia analiz incydentu' })
  @ApiOkResponse({
    description: 'Analizy, od najnowszych',
    type: IncidentAnalysis,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Projekt lub incydent nie istnieje',
    type: NotFoundErrorDto,
  })
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.analysisService.findAll(projectId, incidentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz analizę' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator analizy',
  })
  @ApiOkResponse({ description: 'Analiza', type: IncidentAnalysis })
  @ApiNotFoundResponse({
    description: 'Projekt, incydent lub analiza nie istnieje',
    type: NotFoundErrorDto,
  })
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.analysisService.findOne(projectId, incidentId, id);
  }
}
