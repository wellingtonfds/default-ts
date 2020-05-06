import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne , CreateDateColumn } from "typeorm";
import { CrawlerKeyWords } from './CrawlerKeyWords';


@Entity()
export class CrawlerImages {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => CrawlerKeyWords, (crawlerKeyWords:any)=>crawlerKeyWords.images)
    crawler_keyword: CrawlerKeyWords;

    @Column({default:false})
    source_url: string;

    @Column({default: null})
    original_filename:string;

    @Column({default: null})
    checksum:string;

    @Column({default:false})
    location:string

    @Column({default:false})
    valid:boolean;

    @Column({default:false})
    uploaded_id:number;

    @CreateDateColumn({default:false})
    created_at:Date

    @Column({default: null})
    uploaded_at:Date;

    @Column({default: null})
    transcribed_at:Date;
    
    @Column({default: null})
    published_at:Date;
}
