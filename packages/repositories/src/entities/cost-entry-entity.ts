import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('cost_entry')
export class CostEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  accountId!: string

  @Column()
  resourceId!: string

  @Column()
  resourceName!: string

  @Column('float')
  cost!: number

  @Column()
  currency!: string

  @Column()
  month!: string
}
