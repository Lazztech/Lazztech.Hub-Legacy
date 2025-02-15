import { Field, ID, ObjectType } from 'type-graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JoinUserInAppNotifications } from './joinUserInAppNotifications.entity';

@ObjectType()
@Entity()
export class InAppNotification {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  public id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public header: string;

  @Field()
  @Column()
  public text: string;

  @Field()
  @Column()
  public date: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public thumbnail: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public actionLink: string;

  @OneToMany(
    () => JoinUserInAppNotifications,
    joinUserInAppNotifications => joinUserInAppNotifications.user,
  )
  public usersConnection: Promise<JoinUserInAppNotifications[]>;
}
