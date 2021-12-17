import { Catagory } from './Catagory';
import { Video } from './Video';
import { 
  BaseEntity, 
  Column, 
  Entity, 
  JoinColumn, 
  ManyToOne
} from "typeorm";

@Entity()
export class VideoCatagory extends BaseEntity {
  @Column({
    primary: true
  })
  public videoId: string

  @Column({
    primary: true
  })
  public catagoryId: string

  @ManyToOne(
    _type=>Video,
    video => video.catagoryConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'videoId'})
  public readonly video: Video

  @ManyToOne(
    _type=>Catagory,
    catagory => catagory.videoConnection,
    {
      cascade: true
    }
  )
  @JoinColumn({name: 'catagoryId'})
  public readonly catagory: Catagory
}