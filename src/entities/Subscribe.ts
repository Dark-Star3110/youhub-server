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

  @ManyToOne((_type) => User, (user) => user.subscribersConnection, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "subscriberId", referencedColumnName: "id" })
  public readonly subscriber: User;

  @ManyToOne((_type) => User, (user) => user.chanelsConnection, {
    cascade: true,
    // onDelete: "CASCADE",
  })
  @JoinColumn({ name: "chanelId", referencedColumnName: "id" })
  public readonly chanel: User;

  @Column({
    default: false,
  })
  public isNotification: boolean;

  @CreateDateColumn({
    type: "datetimeoffset",
  })
  public readonly subscribedAt: Date;
}
