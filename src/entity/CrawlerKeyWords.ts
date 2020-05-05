import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { CrawlerImages } from './CrawlerImages';

@Entity()
export class CrawlerKeyWords {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    keyword:string;

    @Column()
    crawled_total:number

    @CreateDateColumn()
    created_at :Date

    @Column()
    ended_at :Date

    @OneToMany(type => CrawlerImages, (crawlerImages: any) => crawlerImages.images)
    category: CrawlerImages[];
}
