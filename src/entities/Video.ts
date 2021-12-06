import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
@Entity()
export class Video extends BaseEntity {
  // ! la not null
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  userId!: string;

  @Column()
  commentable!: boolean;

  @Column()
  thumbNailUrl: string;

  @Column()
  size!: number;

  @CreateDateColumn({
    type: "datetime2",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "datetime2",
  })
  updatedAt: Date;
}
