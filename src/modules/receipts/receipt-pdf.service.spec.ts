import { ReceiptPdfService } from './receipt-pdf.service';

type PdfInternals = {
  tryLoadBrowserAutomation: () => Promise<unknown>;
  renderWithBrowser: (...args: unknown[]) => Promise<Buffer>;
  renderFallbackPdf: (...args: unknown[]) => Promise<Buffer>;
};

describe('PDF template fidelity', () => {
  let service: ReceiptPdfService;
  let internals: PdfInternals;
  beforeEach(() => {
    service = new ReceiptPdfService();
    internals = service as unknown as PdfInternals;
  });

  it('does not silently replace a selected template with the fallback PDF layout', async () => {
    jest.spyOn(internals, 'tryLoadBrowserAutomation').mockResolvedValue(null);
    const fallback = jest.spyOn(internals, 'renderFallbackPdf');
    await expect(
      service.render('<main>Custom</main>', {}, undefined, {
        requireHtml: true,
      }),
    ).rejects.toThrow('Chromium');
    expect(fallback).not.toHaveBeenCalled();
  });

  it('propagates browser errors so the receipt can be retried with its original design', async () => {
    jest
      .spyOn(internals, 'tryLoadBrowserAutomation')
      .mockResolvedValue({ module: {} });
    jest
      .spyOn(internals, 'renderWithBrowser')
      .mockRejectedValue(new Error('Browser unavailable'));
    const fallback = jest.spyOn(internals, 'renderFallbackPdf');
    await expect(
      service.render('custom-html', {}, undefined, { requireHtml: true }),
    ).rejects.toThrow('Browser unavailable');
    expect(fallback).not.toHaveBeenCalled();
  });

  it('retains fallback support for old receipts without a design snapshot', async () => {
    jest.spyOn(internals, 'tryLoadBrowserAutomation').mockResolvedValue(null);
    jest
      .spyOn(internals, 'renderFallbackPdf')
      .mockResolvedValue(Buffer.from('legacy-pdf'));
    expect(await service.render('legacy-html', {})).toEqual(
      Buffer.from('legacy-pdf'),
    );
  });
});
