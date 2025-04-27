import { Controller, Get, Param, Patch } from '@nestjs/common';
import { Book } from './books.entity';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(): Promise<Book[]> {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch('update-all-with-year')
  async updateAllWithYear(): Promise<{
    updatedCount: number;
    errorCount: number;
    errors: string[];
  }> {
    return this.booksService.updateAllWithYear();
  }
}
