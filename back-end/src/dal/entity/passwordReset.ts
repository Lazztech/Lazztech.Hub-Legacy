import { Field, ID } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user';

@Entity()
export class PasswordReset {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public pin: string;
}
