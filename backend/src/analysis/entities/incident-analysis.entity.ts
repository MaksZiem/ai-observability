import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Incident } from '../../incidents/entities/incident.entity.js';
import { User } from '../../users/entities/user.entity.js';
import type { AnalysisResult } from '../analysis-result.js';
import { AnalysisResultDto } from '../dto/analysis-result.dto.js';

export enum AnalysisStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('incident_analyses')
@Index(['incidentId', 'createdAt'])
export class IncidentAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  incidentId: string;

  @ApiHideProperty()
  @ManyToOne(() => Incident, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'incidentId' })
  incident: Incident;

  @Column()
  requestedById: string;

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING,
  })
  status: AnalysisStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string | null;

  @ApiPropertyOptional({ type: () => AnalysisResultDto, nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  result: AnalysisResult | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'int', nullable: true })
  inputTokens: number | null;

  @Column({ type: 'int', nullable: true })
  outputTokens: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
