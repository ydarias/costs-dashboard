import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('account')
export class AccountEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  apiKey!: string;
}
