import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Operator } from './operator.entity';

@Entity('operator_config')
export class OperatorConfig {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  operatorId: string;

  @OneToOne(() => Operator)
  @JoinColumn({ name: 'operatorId' })
  operator: Operator;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minBet: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  maxBet: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  maxWinPerTicket: number;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  volatilityMode: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  defaultLanguage: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 11.0 })
  houseEdgeTarget: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
