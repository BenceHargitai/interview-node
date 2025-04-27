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

  async updateAllWithYear(): Promise<void> {
    const books = await this.bookRepository.find();

    for (const book of books) {
      try {
        const details = await this.openLibraryClientService.getBookDetails(
          book.workId,
        );
        if (details?.first_publish_date) {
          const year = new Date(details.first_publish_date).getFullYear();
          if (year) {
            book.year = year;
            await this.bookRepository.save(book);
          }
        }
      } catch (error) {
        console.error(`Failed to update book: ${book.id}:`, error.message);
      }
    }
  }
}
