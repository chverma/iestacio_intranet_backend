import { Injectable, HttpException, HttpStatus, NotImplementedException } from '@nestjs/common';
import { FileInfoVm } from './view-models/file-info-vm.model';

@Injectable()
export class FilesService {

  async findInfo(id: string): Promise<FileInfoVm> {
    throw new NotImplementedException();
  }

  async deleteFile(id: string): Promise<boolean> {
    throw new NotImplementedException();
  }
}
