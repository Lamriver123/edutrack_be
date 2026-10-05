# Database backup to Google Drive

Backup chạy lúc **02:00 giờ Việt Nam**. Backend xuất các collection (bỏ `system.*`) thành JSON, gzip, upload vào thư mục cấu hình, rồi giữ tối đa `BACKUP_MAX_COUNT` bản. Nếu xuất một collection hoặc upload thất bại, không dọn các backup cũ. Bản hiện tại là JSON gzip; không phải snapshot transaction xuyên collection hoặc bản BSON có index metadata.

## Chọn đúng loại Drive

- **Google Workspace Shared Drive**: dùng `GOOGLE_SERVICE_ACCOUNT_KEY`, thêm service account làm thành viên có quyền upload và dọn file cũ. Dùng ID thư mục nằm trong Shared Drive cho `GOOGLE_DRIVE_BACKUP_FOLDER_ID`. API sẽ kiểm tra `driveId`, quyền thêm file, và hỗ trợ Shared Drives khi upload/list/delete. Xóa vĩnh viễn file trong Shared Drive có thể cần vai trò Manager.
- **My Drive / Drive của tôi**: chia sẻ thư mục với service account ở quyền Editor chưa đủ. Service account không có storage quota để sở hữu file. Dùng OAuth của tài khoản sở hữu thư mục: `GOOGLE_DRIVE_OAUTH_CLIENT_ID`, `GOOGLE_DRIVE_OAUTH_CLIENT_SECRET`, `GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN`; vẫn dùng Folder ID hiện tại. Token cần scope `https://www.googleapis.com/auth/drive` và quyền truy cập offline. OAuth ưu tiên khi cấu hình đầy đủ cả ba biến. Giữ các secret trong backend env.

Scope `drive.file` chỉ truy cập file/thư mục được mở/tạo qua ứng dụng; nó có thể trả 404 với thư mục có sẵn được chia sẻ thủ công. Service account sử dụng scope `drive` để truy cập thư mục cấu hình theo quyền đã cấp cho tài khoản. Việc dọn file chỉ chọn tên backup đúng mẫu `edutrack_backup_YYYY-MM-DD_HH-mm-ss.json.gz`, không xóa file khác trong thư mục.

Nguồn: [Google: thư mục và giới hạn service account](https://developers.google.com/workspace/drive/api/guides/folder), [Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth), [Shared Drive API support](https://developers.google.com/workspace/drive/api/guides/enable-shareddrives).

## Kết nối Drive cá nhân

Đăng nhập Google một lần trên máy local để lấy refresh token, sau đó đưa cấu hình OAuth lên backend Render. Lệnh kết nối không đọc MongoDB và không tạo/xóa file trên Drive.

1. Trong Google Cloud chọn dự án `edutrack-510308`; kiểm tra **Google Drive API** đã được bật trong **APIs & Services → Library**.
2. Mở **Google Auth Platform**. Nếu chưa thiết lập, bấm **Get started**: tên ứng dụng `EduTrack Backup`, email hỗ trợ và liên hệ là email của bạn, **Audience: External**. Trong **Data Access**, thêm scope `https://www.googleapis.com/auth/drive`.
3. Mở **Clients → Create client**, chọn **Desktop app**, tên `EduTrack Backup`, rồi **Create** và tải JSON. Lưu file ở `edutrack_be/.tmp/drive-oauth-client.json`; `.tmp` đã được loại khỏi Git. Đây là file OAuth, khác với JSON service account.
4. Trong **Audience**, để chạy lâu dài chọn **Publish app / In production** trước khi cấp quyền. Nếu đang thử bằng **Testing**, thêm tài khoản sở hữu thư mục vào **Test users**. Với quyền Drive, refresh token cấp lúc Testing hết hạn sau 7 ngày; sau khi đổi sang In production cần kết nối lại để lấy token mới. [Google: thiết lập consent](https://developers.google.com/workspace/guides/configure-oauth-consent), [Google: tạo Desktop client](https://developers.google.com/workspace/guides/create-credentials), [Google: thời hạn refresh token](https://developers.google.com/identity/protocols/oauth2#expiration).

   Nếu nút Publish app bị khóa kèm thông báo hoàn thiện Branding, mở **Branding**, điền tên ứng dụng, email hỗ trợ/liên hệ và các trường bắt buộc. Sau khi frontend chứa các trang công khai mới đã deploy lên Vercel, dùng:

   | Trường Branding              | Giá trị                                  |
   | ---------------------------- | ---------------------------------------- |
   | Authorized domains           | `edutrack-fe.vercel.app`                 |
   | Application home page        | `https://edutrack-fe.vercel.app/about`   |
   | Application privacy policy   | `https://edutrack-fe.vercel.app/privacy` |
   | Application terms of service | `https://edutrack-fe.vercel.app/terms`   |

   Các trang phải mở được mà không đăng nhập. Không dùng dashboard protected làm trang giới thiệu, và không nhập URL của trang chưa deploy. Nếu Google yêu cầu xác minh tên miền, dùng Google Search Console với URL prefix `https://edutrack-fe.vercel.app/` và xác minh bằng HTML file hoặc thẻ meta theo hướng dẫn của Google. Chức năng backup chỉ cấp quyền bằng tài khoản của chủ Drive; trường hợp sử dụng cá nhân có ngoại lệ đối với việc gửi xét duyệt ứng dụng, nhưng trạng thái Testing vẫn giới hạn thời hạn token. [Google: Branding](https://support.google.com/cloud/answer/15549049), [Google: ngoại lệ sử dụng cá nhân](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification#exceptions).

5. Đặt Folder ID trong `.env` backend. Thư mục hiện tại `EduTrack Backups` dùng `GOOGLE_DRIVE_BACKUP_FOLDER_ID=1L1j5QFpmCq_i_dHv64TsfYOhR19tcyPp`. Chạy trong thư mục `edutrack_be`:

   ```powershell
   npm run build
   node dist/modules/backup/backup-oauth.cli.js --client .tmp/drive-oauth-client.json
   ```

6. Mở link công cụ in ra trên trình duyệt **cùng máy đang chạy lệnh**, đăng nhập tài khoản sở hữu thư mục và cấp quyền Drive. Công cụ dùng callback `127.0.0.1` với state và PKCE, chờ tối đa 10 phút. Sau khi xác thực và kiểm tra quyền upload vào thư mục thành công, nó cập nhật đúng ba biến OAuth trong `.env`, giữ các cấu hình khác, và lưu bản cấu hình cho Render ở `.tmp/google-drive-oauth.env`. Không in token/secret vào console. [Google: Desktop OAuth](https://developers.google.com/identity/protocols/oauth2/native-app).
7. Chạy `npm run backup:check`. Mở **Render → backend → Environment → Add from .env** và nhập file `.tmp/google-drive-oauth.env` để thêm cấu hình backup. File này chỉ chứa các biến backup, không chứa các cấu hình database/JWT/SMTP khác. Nếu nhập từng ô, dùng giá trị thực từ file và bỏ dấu nháy ngoài. Các biến OAuth và thư mục gồm:

   - `GOOGLE_DRIVE_OAUTH_CLIENT_ID`
   - `GOOGLE_DRIVE_OAUTH_CLIENT_SECRET`
   - `GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN`
   - `GOOGLE_DRIVE_BACKUP_FOLDER_ID`

   File cũng chứa số lượng backup hiện cấu hình (`BACKUP_MAX_COUNT`, mặc định `30`) và `BACKUP_CATCH_UP_ON_STARTUP=true`. Chọn **Save, rebuild, and deploy** để build code mới với cấu hình. Có thể giữ service account cũ trong env; khi đủ ba biến OAuth, backend chọn OAuth. Không gửi file OAuth hoặc refresh token qua chat và không đưa chúng vào Git. [Render: Environment và Add from .env](https://render.com/docs/configure-environment-variables).

8. Sau deploy, mở backend để nó hoạt động; nếu đã qua 02:00 Việt Nam và chưa có backup trong ngày, chức năng chạy bù sẽ tạo bản backup. Xác nhận bằng log upload thành công **và** file `edutrack_backup_*.json.gz` xuất hiện trong thư mục Drive. Kiểm tra thư mục qua `backup:check` chỉ chứng minh quyền truy cập, chưa chứng minh upload hay khôi phục dữ liệu.

Nếu Google báo `access_denied`, kiểm tra đúng tài khoản và danh sách Test users khi app còn Testing. Nếu báo `invalid_grant` trong lúc backup, cấp quyền lại bằng `backup:connect` rồi cập nhật refresh token trên Render.

## Kiểm tra trên Render

1. Cấu hình biến backup trong **Environment** của backend Render, theo một trong hai cách đăng nhập phía trên. `.env` local không tự cập nhật Environment của Render.
2. Build lại backend rồi chạy `npm run backup:check` trong môi trường cần kiểm tra. Lệnh chỉ đọc metadata thư mục và lịch sử file, không kết nối MongoDB, không bật cron, không upload hoặc xóa file. Nếu cấu hình sai, lệnh trả exit code 1 kèm lý do. Có thể chạy sau build ở local để kiểm tra cùng thông tin Drive.
3. Sau deploy, tìm log `Starting scheduled database backup`, `Uploaded`, `Backup completed` hoặc `Backup failed`. `Google Drive client initialized` chỉ xác nhận khởi tạo client, chưa chứng minh backup thành công.
4. `BACKUP_CATCH_UP_ON_STARTUP=true` cho phép chạy bù sau 15 giây khi backend khởi động sau 02:00 và chưa có file upload thành công trong ngày backup hiện tại. Mặc định bật trong production, tắt trong development. Đã có backup từ 02:00 thì không chạy bù lại. Lịch 02:00 thường vẫn hoạt động như cũ.

Render Free có thể ngủ sau 15 phút không có request; cron trong tiến trình web không chạy khi tiến trình ngủ. Chạy bù sẽ xảy ra **khi backend hoạt động trở lại**, không bảo đảm đúng 02:00 nếu chưa có request đánh thức. Nếu cần đúng giờ, dùng scheduler độc lập hoặc tiến trình luôn chạy. [Render Free](https://render.com/docs/free)

## Hồi quy

```powershell
node node_modules/jest/bin/jest.js --runInBand backup.service.spec.ts google-drive.service.spec.ts backup-oauth.spec.ts
npm run build
npm run backup:check
```

Unit tests dùng model/Drive giả lập, kiểm tra preflight trước khi đọc DB, Shared Drive/OAuth, upload thất bại giữ bản cũ, lỗi export không phát hành bản thiếu dữ liệu, phân trang và không xóa file khác, chạy bù theo ranh giới 02:00 Việt Nam và chống chạy chồng trong cùng tiến trình. Các test OAuth kiểm tra loại client, state/callback, chống tham số trùng và cập nhật env không làm hỏng các cấu hình khác. Chạy `backup:check` là bước kiểm tra quyền Drive thật; nó không chứng minh upload/restore thành công.
