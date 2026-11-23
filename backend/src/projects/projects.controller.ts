import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectWithApiKeyDto } from './dto/project-with-api-key.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectsService } from './projects.service.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('projects')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Utwórz projekt',
    description:
      'Zwraca projekt i pełny klucz API. Klucz jest widoczny tylko w tej odpowiedzi, później dostępny jest wyłącznie jego prefiks.',
  })
  @ApiCreatedResponse({
    description: 'Projekt z kluczem API',
    type: ProjectWithApiKeyDto,
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: JwtPayload) {
    return this.projectsService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista projektów użytkownika' })
  @ApiOkResponse({ description: 'Projekty', type: Project, isArray: true })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.projectsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz projekt' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator projektu',
  })
  @ApiOkResponse({ description: 'Projekt', type: Project })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findOne(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Zaktualizuj projekt',
    description: 'Pola pominięte w body pozostają bez zmian.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator projektu',
  })
  @ApiOkResponse({ description: 'Zaktualizowany projekt', type: Project })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  update(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.update(id, dto, user.sub);
  }

  @Post(':id/api-key/rotate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Wygeneruj nowy klucz API',
    description:
      'Stary klucz przestaje działać od razu. Nowy klucz jest widoczny tylko w tej odpowiedzi.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator projektu',
  })
  @ApiOkResponse({
    description: 'Projekt z nowym kluczem API',
    type: ProjectWithApiKeyDto,
  })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  rotateApiKey(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.rotateApiKey(id, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Usuń projekt',
    description: 'Usuwa projekt razem z całą jego telemetrią i incydentami.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator projektu',
  })
  @ApiNoContentResponse({ description: 'Projekt usunięty' })
  @ApiNotFoundResponse({
    description: 'Projekt nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  remove(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.remove(id, user.sub);
  }
}
