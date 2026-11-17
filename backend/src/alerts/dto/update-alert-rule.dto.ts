import { PartialType } from '@nestjs/swagger';
import { CreateAlertRuleDto } from './create-alert-rule.dto.js';

export class UpdateAlertRuleDto extends PartialType(CreateAlertRuleDto) {}
