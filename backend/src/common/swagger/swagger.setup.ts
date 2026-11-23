import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const BEARER_AUTH = 'access-token';

export const API_KEY_AUTH = 'api-key';

const TITLE = 'AI Observability API';

const DESCRIPTION = `REST API platformy do zbierania telemetrii (logi, spany, błędy, wdrożenia), wykrywania problemów i prowadzenia incydentów z pomocą AI.

## Autoryzacja
- Endpointy aplikacji wymagają tokenu JWT w nagłówku \`Authorization: Bearer <token>\`. Token zwracają **POST /api/auth/register** i **POST /api/auth/login**.
- Endpointy **/api/ingest/*** przyjmują klucz API projektu w nagłówku \`x-api-key\`. Klucz jest pokazywany tylko raz: przy tworzeniu projektu i przy rotacji klucza.
- Strumień zdarzeń **/api/projects/{projectId}/stream** przyjmuje krótkotrwały token z **POST /api/auth/stream-token** w parametrze \`token\`, bo EventSource nie wysyła nagłówków.

Kliknij **Authorize** i wklej sam token (bez słowa "Bearer") lub klucz API, aby wywoływać chronione endpointy z tego widoku.

## Format błędów
Każdy błąd ma spójny format JSON:
\`\`\`json
{
  "statusCode": 409,
  "code": "INCIDENT_LINK_EXISTS",
  "message": "Already linked to this incident",
  "params": {}
}
\`\`\`
- \`code\` to stały identyfikator błędu, na podstawie którego frontend wyświetla przetłumaczony komunikat (PL/EN), a \`params\` zawiera wartości do wstawienia w ten komunikat.
- \`message\` jest po angielsku i służy do debugowania.
- Błędy walidacji danych wejściowych mają kod \`VALIDATION_FAILED\` i zwracają w \`message\` tablicę komunikatów, po jednym na każde niepoprawne pole.
- Identyfikator w ścieżce, który nie jest UUID, daje błąd 400 z kodem \`INVALID_ID\` (\`params.param\` to nazwa parametru).
- Błędy bez własnego kodu dostają kod z nazwy statusu HTTP, np. \`NOT_FOUND\` albo \`UNAUTHORIZED\`.

## Limity
Domyślnie 300 żądań na minutę na adres IP lub klucz API (429 po przekroczeniu). Ingest ma limit 1200 żądań na minutę, a rejestracja, logowanie i zmiana hasła 10 na minutę.

## Język AI
Analiza incydentu przyjmuje pole \`language\` (\`pl\` lub \`en\`), w którym AI pisze wynik.`;

const TAGS: [string, string][] = [
  ['auth', 'Rejestracja, logowanie i konto użytkownika'],
  ['users', 'Profil zalogowanego użytkownika'],
  ['projects', 'Projekty i ich klucze API'],
  ['ingest', 'Przyjmowanie telemetrii z aplikacji (klucz API projektu)'],
  ['logs', 'Logi aplikacji'],
  ['traces', 'Ślady żądań (spany)'],
  ['errors', 'Grupy błędów i pojedyncze wystąpienia'],
  ['deployments', 'Wdrożenia aplikacji'],
  ['metrics', 'Metryki ruchu, błędów i opóźnień'],
  ['alerts', 'Reguły alertów i ich ocena'],
  ['incidents', 'Incydenty, dowody, oś czasu, notatki i powiązania'],
  ['analysis', 'Analiza incydentu przez AI i czat o incydencie'],
  ['realtime', 'Strumień zdarzeń projektu (Server-Sent Events)'],
  ['platform', 'Statystyki działania samej platformy'],
  ['health', 'Stan aplikacji i jej zależności'],
];

export function setupSwagger(app: INestApplication): void {
  const builder = new DocumentBuilder()
    .setTitle(TITLE)
    .setDescription(DESCRIPTION)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT z /api/auth/login lub /api/auth/register',
      },
      BEARER_AUTH,
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Klucz API projektu (do endpointów /api/ingest/*)',
      },
      API_KEY_AUTH,
    );

  for (const [name, description] of TAGS) {
    builder.addTag(name, description);
  }

  const document = SwaggerModule.createDocument(app, builder.build(), {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
  });

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: `${TITLE} Docs`,
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
