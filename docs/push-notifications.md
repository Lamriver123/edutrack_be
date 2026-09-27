# Kiểm tra Web Push EduTrack

## Phân biệt lỗi triển khai và lỗi ứng dụng

Trạng thái triển khai hiện tại: người dùng xác nhận đã xử lý Render ngủ bằng cron từ dịch vụ bên thứ ba và đã kiểm thử cơ chế này. Vì vậy, không coi Render ngủ là nguyên nhân còn tồn tại trong đợt xử lý này; tập trung kiểm tra subscription, VAPID, kết quả gửi tới gateway và hiển thị trên iPhone. Thông tin hạ tầng này do người dùng xác nhận, không phải kết quả kiểm thử tự động trong repository.

Không có dòng log mới chưa đủ để kết luận trang log Render bị đơ. Cần kiểm tra service/instance, khoảng thời gian và bộ lọc log, mức log, lịch sử restart/deploy, rồi tải lại trang log. Phiên bản cũ ghi heartbeat cron bằng `logger.debug`, nên việc không thấy dòng này cũng có thể do bộ lọc. HTTP health thành công chỉ chứng minh API đang trả lời tại thời điểm gọi; không chứng minh cron đã chạy lúc trước đó.

Render Free dừng web service sau 15 phút không có inbound HTTP/WebSocket; request tiếp theo mới đánh thức service. Cron trong cùng tiến trình không chạy khi service ngủ. Việc xem log, thêm log, tăng khoảng quét hoặc lưu trạng thái gửi vào MongoDB không tạo ra một bộ lập lịch độc lập. Đây là giới hạn được [Render mô tả chính thức](https://render.com/docs/free#spinning-down-on-idle).

Thông tin tham khảo nếu sau này thay đổi hạ tầng: có thể tách scheduler sang [background worker chạy liên tục](https://render.com/docs/background-workers) hoặc thiết kế entrypoint thực thi một lượt quét rồi thoát cho [Render Cron Job](https://render.com/docs/cronjobs). Không dùng `npm run start:prod` làm lệnh cron vì lệnh đó khởi động web server và không tự thoát. Repository hiện chưa có entrypoint cron độc lập. Đây là phương án tham khảo, không phải yêu cầu thay đổi cơ chế cron bên thứ ba đã được người dùng kiểm thử.

## Cấu hình

Backend cần ba biến cùng một bộ khóa:

| Biến                | Giá trị                                                     |
| ------------------- | ----------------------------------------------------------- |
| `VAPID_PUBLIC_KEY`  | Public key của bộ VAPID hiện tại                            |
| `VAPID_PRIVATE_KEY` | Private key tương ứng; chỉ lưu trên backend                 |
| `VAPID_SUBJECT`     | Địa chỉ liên hệ `mailto:...` hoặc URL HTTPS hợp lệ          |
| `FRONTEND_URL`      | Origin HTTPS của frontend để CORS cho phép đăng ký thiết bị |

`render.yaml` khai báo VAPID bằng `sync: false`: nhập giá trị trong cấu hình Render. Khai báo trong file không chứng minh các biến đã được điền ở service đang chạy. Không thay `.env` thật bằng `.env.example`; file mẫu chỉ dùng khi thiết lập môi trường mới.

Nếu chưa có bộ khóa, chạy trong `edutrack_be`:

```sh
npx web-push generate-vapid-keys
```

Giữ nguyên bộ khóa giữa các lần deploy. Nếu chủ động đổi khóa, thiết bị phải đăng ký subscription mới; subscription tạo từ public key cũ không tự trở thành subscription của khóa mới. Không ghi private key, JWT, endpoint subscription hoặc `keys.auth` vào ảnh chụp log/ticket hỗ trợ.

Frontend mới lấy public key trực tiếp từ API status ở runtime; không cần `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Mở **Hồ sơ → Thông báo**, dùng nút bật thông báo, **Gửi thông báo thử** và **Kiểm tra lại** để kiểm tra chính thiết bị hiện tại.

Frontend phải chạy trên HTTPS, ngoại trừ localhost phục vụ phát triển. Truy cập IP mạng LAN bằng HTTP không tương đương localhost. Service worker phải đăng ký thành công và có quyền thông báo. Đây là yêu cầu của [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

Trên iPhone/iPad, cần thêm ứng dụng vào Home Screen, mở từ biểu tượng đó và bật thông báo bằng thao tác bấm của người dùng trên phiên bản hỗ trợ Web Push. [WebKit mô tả hỗ trợ từ iOS/iPadOS 16.4](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/). `vibrate` và `requireInteraction` là tùy chọn hiển thị, không bảo đảm thiết bị sẽ rung hoặc ghim thông báo; kiểm tra quyền thông báo của hệ điều hành và chế độ Focus/Không làm phiền. [Tài liệu showNotification](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification) ghi rõ mức hỗ trợ các tùy chọn có thể khác nhau.

## Chẩn đoán theo từng chặng

1. Gọi `GET /api` của backend đã deploy để kiểm tra API hoạt động. Nếu lần gọi đầu bị cold start, đối chiếu thời điểm đó với giờ cron đáng lẽ phải gửi; tải lại log và chọn đúng instance/version.
2. Đăng nhập, mở mục thông báo và bật thông báo trên thiết bị cần nhận. Trong DevTools kiểm tra `sw.js` đã activated, `Notification.permission` là `granted` và API đăng ký trả thành công. Quyền `granted` không đồng nghĩa subscription đã được lưu vào DB.
3. Gọi `GET /api/users/me/push-subscription/status` với `Authorization: Bearer <access-token>`. `configured` phải là `true`, `publicKey` phải có giá trị, `subscriptionCount` phải lớn hơn 0. `configurationError` giải thích cấu hình không hợp lệ nếu có. Số lượng là tổng thiết bị của tài khoản; cần kiểm tra subscription của trình duyệt đang dùng riêng.
4. Bấm gửi thử hoặc gọi `POST /api/users/me/push-subscription/test` với cùng JWT và body `{ "endpoint": "<endpoint của subscription thiết bị hiện tại>" }`. API chỉ thử endpoint thuộc tài khoản đang đăng nhập và chờ kết quả gửi thực tế tới dịch vụ Web Push. Response gồm `attempted`, `sent`, `failed`, `removed`, `configured`, `message`. `sent > 0` chỉ chứng minh gateway nhận yêu cầu; cần nhìn thấy thông báo trên thiết bị để xác nhận chặng cuối. HTTP 201 tự nó không chứng minh push thành công; luôn đọc các bộ đếm và `message`.
5. Nếu gửi thử hoạt động nhưng cron không gửi, kiểm tra tiến trình còn chạy, lịch của đúng giáo viên, giờ Việt Nam, trạng thái lịch hủy, subscription còn tồn tại và cửa sổ nhắc. Không dùng log test thành công để kết luận phần lịch đã hoạt động.
6. Bấm thông báo: lớp dùng `/classes/:classId`, nhắc điểm danh dùng `/classes/:classId?tab=attendance`. `/dashboard/classes/:classId` là đường dẫn cũ sai với App Router hiện tại.

| Dấu hiệu                            | Kiểm tra tiếp                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `configured: false`                 | Thiếu/sai VAPID trên backend thực sự đang chạy; kiểm tra startup log và redeploy sau khi sửa biến |
| `subscriptionCount: 0`              | Chưa đồng bộ subscription, sai tài khoản/API origin, đã đăng xuất hoặc endpoint đã bị dọn         |
| HTTP 401                            | Phiên đăng nhập/JWT; đăng nhập lại trước khi thử push                                             |
| HTTP 400 khi đăng ký                | Subscription phải có endpoint HTTPS của provider được hỗ trợ và đầy đủ `keys.p256dh`, `keys.auth` |
| HTTP 400 khi gửi thử                | Body thiếu/sai endpoint hoặc endpoint không thuộc tài khoản đang đăng nhập                        |
| Push provider trả 404/410           | Endpoint đã hết hiệu lực; backend xóa endpoint đó, bật lại thông báo để đăng ký mới               |
| Push provider trả 401/403           | Đối chiếu bộ VAPID và khóa đã dùng tạo subscription                                               |
| Lỗi timeout/network/5xx             | Kết nối backend tới gateway; xem bộ đếm lỗi và thử lại                                            |
| Gateway nhận nhưng thiết bị im lặng | Service worker, quyền site/OS, Focus, thiết bị offline và điều kiện PWA của trình duyệt           |
| Chỉ mất nhắc khi không ai vào web   | Đối chiếu Free sleep/restart; cần scheduler còn chạy ngoài thời gian có traffic                   |

## Lịch nhắc và khả năng phục hồi

Cron chạy mỗi phút và quét một lượt khoảng 5 giây sau startup. Cửa sổ nhắc trước giờ học là còn hơn 0 đến 30 phút; nhắc điểm danh từ phút thứ 10 đến phút thứ 30 sau giờ bắt đầu, và chỉ khi buổi chưa kết thúc. Cửa sổ này giúp gửi bù khi tiến trình hoạt động trở lại trong hạn; không gửi bù mọi thông báo đã quá hạn. Lịch được xét theo giờ Việt Nam, kể cả buổi gần ranh giới ngày/tuần. Buổi đã hoàn thành/hủy không bị nhắc điểm danh.

`GET /api/schedules/reminders/status` yêu cầu JWT và trả trạng thái lượt quét trong tiến trình hiện tại, thời điểm chạy và lỗi gần nhất. Đối chiếu response này với heartbeat cron mức `log` đầu/cuối lượt quét. Khi có nhiều instance, request status có thể đến instance khác; không dùng response của một instance làm bằng chứng toàn bộ cụm đã chạy.

Collection `push_reminders` dùng khóa duy nhất gồm giáo viên, lớp, ngày, giờ bắt đầu/kết thúc và loại nhắc. Worker giữ lease 2 phút khi gửi. Chỉ ghi `sentAt` khi có ít nhất một endpoint được gateway chấp nhận; nếu tất cả thất bại, lượt sau có thể retry trong cửa sổ nhắc. Marker lưu 7 ngày và được MongoDB TTL dọn, nên restart không mất trạng thái chống gửi lặp.

Cơ chế này có thể gửi lặp nếu tiến trình chết ngay sau khi gateway nhận nhưng trước khi MongoDB ghi `sentAt`; notification `tag` ổn định giúp thay thế thông báo trùng trên các trình duyệt hỗ trợ. Nếu một thiết bị thành công và thiết bị khác lỗi, sự kiện được tính là đã gửi cho giáo viên và không retry riêng thiết bị lỗi. Đây chưa phải hàng đợi giao nhận theo từng thiết bị hay bảo đảm exactly-once.

Web Push giới hạn TTL 30 phút và timeout mỗi request 10 giây. Thiết bị offline có thể nhận chậm trong TTL; thời điểm gateway nhận không đồng nghĩa thời điểm thông báo hiện ra.

## Kịch bản kiểm thử triển khai

Các bước dưới đây cần tài khoản thử và thiết bị do người kiểm thử kiểm soát; không dùng tài khoản phụ huynh/học sinh thật để gửi thử.

| Kịch bản                                     | Kết quả cần quan sát                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| Bật quyền lần đầu                            | Subscription lưu DB, gửi thử hiện thông báo                                   |
| Tải lại app khi quyền đã được cấp            | Subscription hiện tại được đồng bộ lại, không cần xin quyền lần nữa           |
| Tắt/bật thông báo                            | Subscription thiết bị bị gỡ/thêm tương ứng                                    |
| Đăng xuất và đăng nhập lại                   | Thiết bị không nhận tin tài khoản cũ; có thể đăng ký lại                      |
| Từ chối quyền                                | UI chỉ cách đổi quyền trong trình duyệt; không báo thành công giả             |
| Xóa endpoint/thu hồi quyền                   | 404/410 được dọn, không xóa nhầm các thiết bị còn hoạt động                   |
| Backend thiếu VAPID                          | Status/test báo không sẵn sàng; UI thể hiện lỗi                               |
| Gửi thử khi đang ở tab khác/đã đóng tab      | Thông báo hệ điều hành xuất hiện nếu môi trường hỗ trợ và không bị chặn       |
| Nhắc trước giờ dạy, có lịch cố định/override | Đúng lớp, đúng giờ Việt Nam; click mở đúng chi tiết lớp                       |
| Nhắc điểm danh khi chưa điểm danh            | Hiện thông báo; click mở sẵn tab điểm danh                                    |
| Đã điểm danh/hủy lịch                        | Không gửi nhắc điểm danh của buổi đã hoàn thành/hủy                           |
| Khởi động lại ngay trong cửa sổ nhắc         | Trạng thái bền vững ngăn gửi lại sự kiện đã được gateway chấp nhận            |
| Provider lỗi tạm thời                        | Sự kiện không bị đánh dấu gửi thành công; lượt sau có thể thử lại khi còn hạn |
| Service ngủ quá cửa sổ nhắc                  | Không kỳ vọng sửa code đánh thức được server; xác nhận phương án hạ tầng      |

Unit test dùng thời gian giả lập và mock Web Push/MongoDB để kiểm tra các nhánh nghiệp vụ; chúng không chứng minh Render đang chạy hay điện thoại đã hiển thị. Hoàn tất kiểm thử thật bằng cách ghi thời điểm UTC/Việt Nam, service/version, response status/test và ảnh thông báo trên thiết bị, không kèm thông tin xác thực.

Kiểm thử storage với MongoDB thật đang chạy ở `127.0.0.1:27017`:

```sh
npx jest --config test/jest-push-integration.json --runInBand
```

Suite này tạo database riêng tên `edutrack_push_test_<pid>_<uuid>`, kiểm tra projection `select: false`, cập nhật subscription đồng thời, tranh chấp lease, retry và dữ liệu còn sau khi tạo kết nối mới. Nó chỉ xóa database do chính lần chạy đó tạo khi kết thúc; không đọc `.env`, không kết nối database ứng dụng, không khởi động cron và không gửi thông báo ra ngoài.

## Kết quả xác minh bản sửa ngày 2026-09-27

- Backend: toàn bộ 21 suites / 178 tests đạt, gồm cron, HTTP với JWT thật và EventEmitter thật; build đạt; ESLint toàn bộ source/test có 0 lỗi, 0 cảnh báo.
- Storage: 8 integration tests đạt trên MongoDB localhost thật với database riêng đã dọn.
- Frontend: TypeScript, lint và production build đạt; 10 Service Worker tests và 9 Playwright UI tests đạt. Build còn cảnh báo `metadataBase` có sẵn, không liên quan Web Push.
- Các gateway Web Push được giả lập trong kiểm thử, không gửi tới Apple/Google/Mozilla. Chưa triển khai bản sửa lên Render hoặc xác nhận thông báo hiển thị trên iPhone thật. Người dùng xác nhận đã mở PWA từ Màn hình chính trên iPhone 14 Pro Max; sau deploy cần thử nút gửi thông báo trên chính thiết bị này.
