import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenLibraryClientService } from '../open-library/open-library-client.service';
import { Book } from './books.entity';

@Injectable()
export class BooksService {
  readonly DEFAULT_RELATIONS = ['authors'];

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly openLibraryClientService: OpenLibraryClientService,
  ) {}

  findAll(): Promise<Book[]> {
    return this.bookRepository.find({ relations: this.DEFAULT_RELATIONS });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      relations: this.DEFAULT_RELATIONS,
      where: { id },
    });

    if (!book) throw new NotFoundException(`Book with id ${id} not found.`);

    return book;
  }

  async updateAllWithYear(): Promise<{ updatedCount:number, errorCount:number, errors: string[] }> {
    const books = await this.bookRepository.find();
    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const book of books) {
      try {
        if (!book.workId) {
          console.log(`No workId found for book: ${book.id}`);
          errors.push(`No workId found for book: ${book.id}`);
          continue;
        }
        const details = await this.openLibraryClientService.getBookDetails(
          book.workId,
        );
        if (details?.first_publish_date) {
          const year = new Date(details.first_publish_date).getFullYear();
          if (year && !isNaN(year)) {
            book.year = year;
            await this.bookRepository.save(book);
            updatedCount++;
          } else {
            console.log(`Invalid year for book: ${book.id}`);
            errors.push(`Invalid year for book: ${book.id}`);
            errorCount++;
          }
        } else {
          console.log(`No first publish date found for book: ${book.id}`);
          errors.push(`No first publish date found for book: ${book.id}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Failed to update book: ${book.id}:`, error.message);
        errors.push(`Failed to update book: ${book.id}: ${error.message}`);
        errorCount++;
      }
    }
    return {
      updatedCount,
      errorCount,
      errors,
    };
  }
}
