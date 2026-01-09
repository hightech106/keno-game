import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Round } from './round.entity';
import { Operator } from './operator.entity';

@Entity('bets')
@Index(['roundId'])
@Index(['operatorId'])
@Index(['playerId'])
@Index(['createdAt'])
export class Bet {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  betId: string;

  @Column({ type: 'varchar', length: 50 })
  operatorId: string;

  @ManyToOne(() => Operator)
  @JoinColumn({ name: 'operatorId' })
  operator: Operator;

  @Column({ type: 'varchar', length: 100 })
  playerId: string;

  @Column({ type: 'varchar', length: 50 })
  roundId: string;

  @ManyToOne(() => Round)
  @JoinColumn({ name: 'roundId' })
  round: Round;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  betAmount: number;

  @Column({ type: 'integer' })
  selectionCount: number;

  @Column({ type: 'integer', array: true })
  numbersSelected: number[];

  @Column({ type: 'integer', nullable: true })
  hitsCount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  payoutMultiplier: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  winAmount: number;

  @Column({ type: 'boolean', default: false })
  credited: boolean;

  @Column({ type: 'boolean', default: false })
  maxWinCapApplied: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
