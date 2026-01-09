import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RoundStatus } from '../../common/enums/round-status.enum';

@Entity('rounds')
@Index(['status'])
@Index(['scheduledTime'])
export class Round {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  roundId: string;

  @Column({
    type: 'enum',
    enum: RoundStatus,
    default: RoundStatus.OPEN,
  })
  status: RoundStatus;

  @Column({ type: 'timestamp' })
  scheduledTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  openTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  closeTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  drawTime: Date;

  @Column({ type: 'integer', array: true, nullable: true })
  numbersDrawn: number[];

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalBet: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalPayout: number;

  @Column({ type: 'boolean', default: false })
  resultPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
