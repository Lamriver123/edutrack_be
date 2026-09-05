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

type CloudinaryUploadOptions = {
  publicId?: string;
  overwrite?: boolean;
  filenameOverride?: string;
};

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {}

  async uploadStudentAvatar(file: UploadImageFile) {
    const folder =
      this.configService.get<string>('cloudinary.studentAvatarFolder') ??
      'edutrack/student-avatars';

    return this.uploadFile(file, folder, 'image');
  }

  async uploadTeacherAvatar(file: UploadImageFile) {
    const folder =
      this.configService.get<string>('cloudinary.teacherAvatarFolder') ??
      'edutrack/teacher-avatars';

    return this.uploadFile(file, folder, 'image');
  }

  async uploadClassImage(file: UploadImageFile) {
    const folder =
      this.configService.get<string>('cloudinary.classImageFolder') ??
      'edutrack/class-images';

    return this.uploadFile(file, folder, 'image');
  }

  async uploadExamFile(file: UploadImageFile) {
    const folder =
      this.configService.get<string>('cloudinary.examFileFolder') ??
      'edutrack/exam-files';

    return this.uploadFile(file, folder, 'auto');
  }

  async uploadExamEvidenceImage(file: UploadImageFile) {
    const folder =
      this.configService.get<string>('cloudinary.examEvidenceFolder') ??
      'edutrack/exam-evidence';

    return this.uploadFile(file, folder, 'image');
  }

  async uploadReceiptPdf(file: UploadImageFile) {
    const folder =
      this.configService.get<string>('cloudinary.receiptPdfFolder') ??
      'edutrack/receipts';
    const pdfFileName = this.ensureFileExtension(file.originalname, '.pdf');

    return this.uploadFile(file, folder, 'raw', {
      publicId: this.toSafeCloudinaryPublicId(pdfFileName),
      overwrite: true,
      filenameOverride: pdfFileName,
    });
  }

  async uploadReceiptPaymentProof(file: UploadImageFile) {
    const folder =
      this.configService.get<string>('cloudinary.receiptPaymentProofFolder') ??
      'edutrack/receipt-payment-proofs';

    return this.uploadFile(file, folder, 'image');
  }

  private async uploadFile(
    file: UploadImageFile,
    folder: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image',
    options: CloudinaryUploadOptions = {},
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
    const uploadParams: Record<string, string> = {
      folder,
      timestamp,
    };

    if (options.publicId) {
      uploadParams.public_id = options.publicId;
    }

    if (options.overwrite !== undefined) {
      uploadParams.overwrite = String(options.overwrite);
    }

    if (options.filenameOverride) {
      uploadParams.filename_override = options.filenameOverride;
    }

    const signature = this.createSignature(uploadParams, apiSecret);
    const formData = new FormData();
    const encodedFile = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    formData.append('file', encodedFile);
    formData.append('api_key', apiKey);
    Object.entries(uploadParams).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );
    const payload = (await response.json()) as CloudinaryUploadPayload;

    if (!response.ok || !payload.secure_url || !payload.public_id) {
      throw new BadGatewayException(
        payload.error?.message || 'Không thể tải file lên Cloudinary.',
      );
    }

    return {
      url: payload.secure_url,
      publicId: payload.public_id,
    };
  }

  private ensureFileExtension(fileName: string, extension: string) {
    const normalizedFileName = fileName.trim() || `file${extension}`;

    return normalizedFileName.toLowerCase().endsWith(extension)
      ? normalizedFileName
      : `${normalizedFileName}${extension}`;
  }

  private toSafeCloudinaryPublicId(fileName: string) {
    const extensionMatch = /\.[a-z0-9]+$/i.exec(fileName);
    const extension = extensionMatch?.[0].toLowerCase() ?? '';
    const baseName = extension
      ? fileName.slice(0, -extension.length)
      : fileName;
    const safeBaseName =
      baseName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'receipt';

    return `${safeBaseName}${extension}`;
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
