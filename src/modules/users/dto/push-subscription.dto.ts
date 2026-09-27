import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  ValidateBy,
  ValidateNested,
} from 'class-validator';

// Only browser push gateways may receive outbound requests from this API.
// Never accept an arbitrary HTTPS address as a push gateway (SSRF).
export function isSupportedPushEndpoint(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.hash &&
      (['fcm.googleapis.com', 'android.googleapis.com'].includes(
        url.hostname,
      ) ||
        [
          'push.services.mozilla.com',
          'push.apple.com',
          'notify.windows.com',
        ].some(
          (domain) =>
            url.hostname === domain || url.hostname.endsWith(`.${domain}`),
        ))
    );
  } catch {
    return false;
  }
}

export class PushEndpointDto {
  @IsString()
  @MaxLength(4096)
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @ValidateBy({
    name: 'supportedPushEndpoint',
    validator: {
      validate: isSupportedPushEndpoint,
      defaultMessage: () =>
        'Endpoint không thuộc dịch vụ Web Push được hỗ trợ.',
    },
  })
  endpoint: string;
}

class PushSubscriptionKeysDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{87}=?$/)
  p256dh: string;

  @IsString()
  @Matches(/^[A-Za-z0-9_-]{22}(?:==)?$/)
  auth: string;
}

export class PushSubscriptionDto extends PushEndpointDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys: PushSubscriptionKeysDto;

  // Present (usually null) in PushSubscription.toJSON().
  @IsOptional()
  @IsNumber()
  @Min(0)
  expirationTime?: number | null;
}
