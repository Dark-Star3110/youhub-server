import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
} from "typeorm";

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  videoId: string;

  @Column()
  content: string;

  @Column()
  parentCommentId: string;

  @CreateDateColumn({
    type: "datetime2",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "datetime2",
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: "datetime2",
  })
  deletedAt: Date;
}
