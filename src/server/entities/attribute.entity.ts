import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { CategoryAttribute } from './category.attribute.entity.js';

export type AttributeType = 'Varchar' | 'Int' | 'Date' | 'Decimal' | 'Text';

@Entity()
export class Attribute {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Index({ unique: true })
  @Column('varchar', { length: 256 })
  name: string;

  @Column('varchar', { length: 64 })
  type: AttributeType;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @OneToMany(
    () => CategoryAttribute,
    (categoryAttributes) => categoryAttributes.attribute
  )
  categoryAttributes: Relation<CategoryAttribute>[];
}
