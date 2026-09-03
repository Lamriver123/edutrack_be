import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

export type UploadImageFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export type CloudinaryUploadResponse = {
  url: string;
  publicId: string;
};

type CloudinaryUploadPayload = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {}

  async uploadStudentAvatar(file: UploadImageFile) {
    const folder =
      this.configService.get<string>('cloudinary.studentAvatarFolder') ??
      'edutrack/student-avatars';

    return this.uploadImage(file, folder);
  }

  private async uploadImage(
    file: UploadImageFile,
    folder: string,
  ): Promise<CloudinaryUploadResponse> {
    const cloudName =
      this.configService.get<string>('cloudinary.cloudName')?.trim() ?? '';
    const apiKey =
      this.configService.get<string>('cloudinary.apiKey')?.trim() ?? '';
    const apiSecret =
      this.configService.get<string>('cloudinary.apiSecret')?.trim() ?? '';

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException('Chưa cấu hình Cloudinary.');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.createSignature({ folder, timestamp }, apiSecret);
    const formData = new FormData();
    const encodedFile = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    formData.append('file', encodedFile);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('folder', folder);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );
    const payload = (await response.json()) as CloudinaryUploadPayload;

    if (!response.ok || !payload.secure_url || !payload.public_id) {
      throw new BadGatewayException(
        payload.error?.message || 'Không thể tải ảnh lên Cloudinary.',
      );
    }

    return {
      url: payload.secure_url,
      publicId: payload.public_id,
    };
  }

  private createSignature(params: Record<string, string>, apiSecret: string) {
    const signedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return createHash('sha1')
      .update(`${signedParams}${apiSecret}`)
      .digest('hex');
  }
}
