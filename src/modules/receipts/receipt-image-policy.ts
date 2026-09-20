const builtInImages = new Set([
  '/sticker.png',
  '/logo.png',
  '/invoice-student.svg',
  '/invoice-class.svg',
]);

export function receiptBuiltInImagePath(value: string) {
  try {
    const url = new URL(value, 'https://edutrack.invalid');
    return builtInImages.has(url.pathname) ? url.pathname : null;
  } catch {
    return null;
  }
}

export function isReceiptCloudImage(value: string) {
  return isAllowedHttpsHost(value, ['res.cloudinary.com']);
}

export function isReceiptBrowserRequestAllowed(value: string) {
  return (
    /^data:image\/(png|jpeg|webp|svg\+xml);base64,/i.test(value) ||
    isAllowedHttpsHost(value, [
      'res.cloudinary.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
    ])
  );
}

function isAllowedHttpsHost(value: string, hosts: string[]) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      hosts.includes(url.hostname)
    );
  } catch {
    return false;
  }
}
