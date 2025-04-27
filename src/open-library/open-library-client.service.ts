import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OpenLibraryClientService {
  constructor(private readonly httpService: HttpService) {}

  async getBookDetails(workId: string): Promise<any> {
    const url = `https://openlibrary.org/works/${workId}.json`;
    const response = await lastValueFrom(this.httpService.get(url));
    return response.data;
  }
}
