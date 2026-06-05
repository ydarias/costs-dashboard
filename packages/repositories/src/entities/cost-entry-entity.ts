import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cost_entry')
export class CostEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  accountId!: string;

  @Column()
  resourceInstanceId!: string;

  @Column({ nullable: true, type: 'text' })
  resourceInstanceName!: string | null;

  @Column()
  resourceId!: string;

  @Column({ nullable: true, type: 'text' })
  resourceName!: string | null;

  @Column()
  planId!: string;

  @Column({ nullable: true, type: 'text' })
  planName!: string | null;

  @Column({ nullable: true, type: 'text' })
  region!: string | null;

  @Column({ nullable: true, type: 'text' })
  resourceGroupId!: string | null;

  @Column({ nullable: true, type: 'text' })
  resourceGroupName!: string | null;

  @Column('float')
  cost!: number;

  @Column()
  currency!: string;

  @Column()
  month!: string;
}
