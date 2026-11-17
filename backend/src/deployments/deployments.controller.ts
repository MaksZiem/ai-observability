import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { DeploymentsService } from './deployments.service.js';
import { CreateDeploymentDto } from './dto/create-deployment.dto.js';
import { ListDeploymentsQueryDto } from './dto/list-deployments-query.dto.js';
import { Deployment } from './entities/deployment.entity.js';

@ApiTags('deployments')
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
@ApiNotFoundResponse({
  description: 'Projekt nie istnieje lub należy do innego użytkownika',
  type: NotFoundErrorDto,
})
@Controller('projects/:projectId/deployments')
export class DeploymentsController {
  constructor(
    private readonly deploymentsService: DeploymentsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista wdrożeń',
    description:
      'Wdrożenia od najnowszych, z opcjonalnym filtrem po czasie i usłudze (filtr usługi zwraca też wdrożenia bez usługi).',
  })
  @ApiOkResponse({
    description: 'Wdrożenia',
    type: Deployment,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe parametry zapytania',
    type: BadRequestErrorDto,
  })
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListDeploymentsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.deploymentsService.findAll(projectId, query);
  }

  @Post()
  @ApiOperation({
    summary: 'Zarejestruj wdrożenie',
    description:
      'Ręczne dodanie wdrożenia z panelu. Systemy CI mogą to robić przez POST /api/ingest/deployments z kluczem API.',
  })
  @ApiCreatedResponse({ description: 'Zapisane wdrożenie', type: Deployment })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateDeploymentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.deploymentsService.create(projectId, dto);
  }
}
