import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { CrawlerImages } from './CrawlerImages';

@Entity()
export class CrawlerKeyWords {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    keyword:string;

    @Column()
    category:string;

    @Column({default: 0})
    crawled_total:number

    @CreateDateColumn({default: null})
    created_at :Date

    @UpdateDateColumn({default: null})
    updated_at :Date

    @Column({default: null})
    ended_at :Date

    @OneToMany(type => CrawlerImages, (crawlerImages: any) => crawlerImages.images)
    keywordImages: CrawlerImages[];
}
