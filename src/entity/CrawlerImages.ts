import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne , CreateDateColumn } from "typeorm";
import { CrawlerKeyWords } from './CrawlerKeyWords';


@Entity()
export class CrawlerImages {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => CrawlerKeyWords, (crawlerKeyWords:any)=>crawlerKeyWords.images)
    crawler_keyword: CrawlerKeyWords;

    @Column()
    source_url: string;

    @Column()
    original_filename:string;

    @Column({default: null})
    checksum:string;

    @Column()
    location:string

    @Column({default:false})
    valid:boolean;

    @Column()
    uploaded_id:number;

    @CreateDateColumn()
    created_at:Date

    @Column({default: null})
    uploaded_at:Date;

    @Column({default: null})
    transcribed_at:Date;
    
    @Column({default: null})
    published_at:Date;
}
