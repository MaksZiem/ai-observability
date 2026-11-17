import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator.js';
import {
  BadRequestErrorDto,
  TooManyRequestsErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { API_KEY_AUTH } from '../common/swagger/swagger.setup.js';
import { DeploymentsService } from '../deployments/deployments.service.js';
import { CreateDeploymentDto } from '../deployments/dto/create-deployment.dto.js';
import { Deployment } from '../deployments/entities/deployment.entity.js';
import { IngestExceptionFilter } from '../platform/ingest-exception.filter.js';
import { IngestStatsInterceptor } from '../platform/ingest-stats.interceptor.js';
import type { Project } from '../projects/entities/project.entity.js';
import { CurrentProject } from './decorators/current-project.decorator.js';
import { IngestAcceptedDto } from './dto/ingest-accepted.dto.js';
import { IngestErrorsDto } from './dto/ingest-errors.dto.js';
import { IngestLogsDto } from './dto/ingest-logs.dto.js';
import { IngestSpansDto } from './dto/ingest-spans.dto.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { withReceivedAt } from './ingest-queue.js';
import { IngestQueueService } from './ingest-queue.service.js';

@ApiTags('ingest')
@ApiSecurity(API_KEY_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak klucza API lub klucz nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@ApiBadRequestResponse({
  description: 'Nieprawidłowa paczka danych',
  type: BadRequestErrorDto,
})
@ApiTooManyRequestsResponse({
  description: 'Przekroczony limit 1200 żądań na minutę dla klucza',
  type: TooManyRequestsErrorDto,
})
@Public()
@Throttle({ default: { limit: 1200, ttl: 60_000 } })
@UseGuards(ApiKeyGuard)
@UseInterceptors(IngestStatsInterceptor)
@UseFilters(IngestExceptionFilter)
@Controller('ingest')
export class IngestController {
  constructor(
    private readonly queueService: IngestQueueService,
    private readonly deploymentsService: DeploymentsService,
  ) {}

  @Post('logs')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Wyślij logi',
    description:
      'Przyjmuje paczkę logów do kolejki i odpowiada od razu, bez czekania na zapis. Wrażliwe pola są maskowane przed zapisem.',
  })
  @ApiAcceptedResponse({
    description: 'Logi przyjęte do kolejki',
    type: IngestAcceptedDto,
  })
  async ingestLogs(
    @Body() dto: IngestLogsDto,
    @CurrentProject() project: Project,
  ) {
    await this.queueService.enqueue({
      type: 'logs',
      projectId: project.id,
      items: withReceivedAt(dto.logs, new Date()),
    });
    return { accepted: dto.logs.length };
  }

  @Post('spans')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Wyślij spany',
    description:
      'Przyjmuje paczkę spanów do kolejki. Spany z tym samym traceId tworzą jeden ślad.',
  })
  @ApiAcceptedResponse({
    description: 'Spany przyjęte do kolejki',
    type: IngestAcceptedDto,
  })
  async ingestSpans(
    @Body() dto: IngestSpansDto,
    @CurrentProject() project: Project,
  ) {
    await this.queueService.enqueue({
      type: 'spans',
      projectId: project.id,
      items: dto.spans,
    });
    return { accepted: dto.spans.length };
  }

  @Post('errors')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Wyślij błędy',
    description:
      'Przyjmuje paczkę błędów do kolejki. Podobne błędy są łączone w grupy.',
  })
  @ApiAcceptedResponse({
    description: 'Błędy przyjęte do kolejki',
    type: IngestAcceptedDto,
  })
  async ingestErrors(
    @Body() dto: IngestErrorsDto,
    @CurrentProject() project: Project,
  ) {
    await this.queueService.enqueue({
      type: 'errors',
      projectId: project.id,
      items: withReceivedAt(dto.errors, new Date()),
    });
    return { accepted: dto.errors.length };
  }

  @Post('deployments')
  @ApiOperation({
    summary: 'Zarejestruj wdrożenie',
    description:
      'Dla systemów CI/CD. Wdrożenie jest zapisywane od razu i pojawia się na osi czasu metryk.',
  })
  @ApiCreatedResponse({ description: 'Zapisane wdrożenie', type: Deployment })
  ingestDeployment(
    @Body() dto: CreateDeploymentDto,
    @CurrentProject() project: Project,
  ) {
    return this.deploymentsService.create(project.id, dto);
  }
}
