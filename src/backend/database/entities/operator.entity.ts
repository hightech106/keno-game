import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('operators')
export class Operator {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  operatorId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brandName: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  primaryColor: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  defaultLanguage: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  defaultCurrency: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  regionRestrictions: string[];

  @Column({
    type: 'enum',
    enum: ['active', 'suspended'],
    default: 'active',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
