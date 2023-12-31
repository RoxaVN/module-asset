import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Asset } from './asset.entity.js';

@Entity()
export class Store {
  static TYPE_PUBLIC = 'public';
  static TYPE_PRIVATE = 'private';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid', { nullable: true })
  userId?: string;

  @Column('text')
  name: string;

  @Column('text', { default: Store.TYPE_PUBLIC })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;

  @OneToMany(() => Asset, (assets) => assets.store)
  assets: Relation<Asset>[];
}
