import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Subscribe extends BaseEntity {
  @Column({
    primary: true,
  })
  public chanelId: string;

  @Column({
    primary: true,
  })
  public subscriberId: string;

  @ManyToOne((_type) => User, (user) => user.chanelsConnection, {
    cascade: true,
  })
  @JoinColumn({ name: "chanelId" })
  public readonly chanel: User;

  @ManyToOne((_type) => User, (user) => user.subscribersConnection, {
    cascade: true,
  })
  @JoinColumn({ name: "subscriberId" })
  public readonly subscriber: User;

  @Column({
    default: false,
  })
  public isNotification: boolean;

  @CreateDateColumn({
    type: "datetimeoffset",
  })
  public readonly subscribedAt: Date;
}
