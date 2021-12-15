import { VideoCatagory } from './VideoCatagory';
import { 
  BaseEntity, 
  Column, 
  Entity, 
  OneToMany, 
  PrimaryGeneratedColumn 
} from "typeorm";
import { Field, ID, ObjectType } from 'type-graphql';
import { Video } from './Video';

@ObjectType()
@Entity()
export class Catagory extends BaseEntity {
  @Field(_type=>ID)
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Field()
  @Column()
  public name: string;

  @OneToMany(
    _type=>VideoCatagory,
    videoCatagory => videoCatagory.catagory
  )
  public readonly videoConnection: VideoCatagory[]
  
  @Field(_type=>[Video], {nullable: true})
  public videos: Video[] 
}
