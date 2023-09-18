import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { Store } from './store.entity.js';
import { Unit } from './unit.entity.js';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;

  @Column('uuid')
  storeId: string;

  @ManyToOne(() => Store, (store) => store.assets)
  store: Relation<Store>;

  @Column('double precision', { default: 1 })
  unitCount: number;

  @Column('bigint', { nullable: true })
  unitId?: string;

  @ManyToOne(() => Unit, (unit) => unit.assets, { nullable: true })
  unit?: Relation<Unit>;
}
