# Invoice Designer: Regions And Images

## Templates

- `SYSTEM_INVOICE_V2` and the receipt renderer share `receipt-template.layout.ts` and `receipt-template.styles.ts`.
- Editor placeholders retain the lesson table, header icons, metadata row, comment boxes and payment lines. Only values are replaced by symbols; region guides do not add padding, margins or fixed heights.
- `SYSTEM_INVOICE_V1` remains available. Existing custom templates are not migrated or overwritten.
- Dynamic sections use `data-edutrack-region`. The registry is returned by `GET /api/invoice-templates/regions`.
- A region is selectable, movable and resizable as a unit. Its inner content is locked in the editor.
- `POST /api/invoice-templates/preview` accepts `{ html, css }` and renders sample receipt data through the existing receipt renderer. It does not write a receipt or change billing state.
- `ReceiptTemplateService.renderCustomTemplate()` resolves regions from a receipt snapshot. Both single-class and merged receipt issuance now use saved designer templates.

## Receipt Template Selection

- The issue dialog lists system templates and saved custom versions. It initially selects the teacher's default custom template, otherwise the default system template. Refresh preserves the selected template if it still exists.
- Preview/issue APIs accept optional `templateId`. Omitted IDs resolve to the teacher's default. Ownership and active-template checks apply before any billing writes.
- Receipt preview returns `template: { id, name, version, revision }`. The client sends `templateRevision` when issuing a previewed template; a content change returns HTTP 409 and requires another preview.
- At issuance, `Receipt.templateSnapshot` stores the selected ID, name, version, revision, HTML and CSS. `renderSnapshot.html` stores the final rendered HTML with real invoice number, data and embedded payment QR. These internal snapshots are not exposed by JSON receipt responses.
- PDF retries and regenerated downloads use the frozen HTML, not the current template or current QR. Old receipts without a template snapshot retain the legacy renderer.
- V1 field-based templates remain supported. Missing real values render blank instead of using editor demonstration values.
- Receipt images must use the Cloudinary image library or built-in assets. Built-ins are embedded for standalone previews/PDFs. CSS image URLs are rejected; use image components instead.
- Custom-template PDF rendering disables JavaScript and restricts browser requests to Cloudinary images and Google Fonts hosts. Configure `PUPPETEER_EXECUTABLE_PATH` or the existing serverless Chromium runtime in deployment. If HTML rendering fails, mark the PDF failed for retry; never silently replace the selected layout with the PDFKit fallback.

## Image Library

Collection: `invoice_images`.

Fields: `teacherId`, `name`, `url`, `publicId`, `mimeType`, `size`, `width`, `height`, `archivedAt`, `createdAt`, `updatedAt`.

- `GET /api/invoice-images?before=<id>`: owner-scoped cursor pagination, 40 images per page.
- `POST /api/invoice-images`: multipart `file`, PNG/JPEG/WEBP, maximum 5 MB. JWT supplies the owner. Signature/MIME validation precedes Cloudinary image decoding.
- Upload destination: `edutrack/invoice-images/<teacherId>` on Cloudinary. MongoDB stores URL/metadata, never image bytes.
- Failed DB persistence attempts cleanup of the newly uploaded Cloudinary asset.
- `DELETE /api/invoice-images/:imageId`: archives only an owned library item. Cloudinary content is retained for existing template/receipt references.
- Inserted images retain `data-edutrack-image-id` in HTML and ProjectJSON. Create/update/duplicate validate all referenced image IDs against the teacher's library, including archived references.

## Verification

Backend tests cover layout, region rendering, escaped data, variable lesson counts, upload validation, Cloudinary/DB failures, pagination, archive behavior and image ownership. Playwright uses mocked authenticated API/Cloudinary responses and actual local image files. No test uploads to the production cloud account or writes teacher data.

Receipt selection tests also cover default/version selection, single-class and merged issue payloads, stale revisions, immutable render snapshots, resource restrictions, load-error retry and mobile layout. A local Chromium smoke test verified a real PDF buffer without issuing a database receipt or uploading to Cloudinary.

The layout comparison test runs the actual backend receipt renderer (via the backend's local `ts-node`) and compares its geometry/styles to a designer preview after save/reload. Both FE and BE dependencies must be installed. This catches CSS serialization regressions, including whitespace longhands and `:last-child` rules.
