# Kiểm tra trùng lịch và tìm giờ trống

Đã triển khai ngày 05/09/2026. Mọi giờ trong tài liệu là giờ Việt Nam, định dạng 24h.

## Quy tắc

- Hai ca trùng khi `startA < endB && startB < endA`. Chạm biên giờ được phép.
- Lịch cố định: trùng lịch cố định của lớp khác thì chặn; trùng lịch tạm thì cảnh báo và vẫn cho xác nhận lưu.
- Xét toàn bộ khoảng hiệu lực của các phiên bản, không giới hạn số tuần tìm kiếm. Version mới kết thúc trước version tương lai kế tiếp của cùng lớp.
- Lịch tạm: xét lịch thực tế sau hủy/dời. Bỏ qua đúng tiết gốc theo lớp/ngày/giờ và override đang sửa. Các tiết khác cùng lớp/ngày vẫn được kiểm tra.
- Lịch của giáo viên khác và lớp đã lưu trữ không tham gia đối chiếu. Lớp tạm dừng vẫn có lịch trên calendar nên vẫn tham gia.
- Thu hồi hoặc thay đổi nguồn lịch tạm phải kiểm tra các tiết được khôi phục để tránh tạo trùng.

## Dữ liệu kiểm tra

Tạo hai lớp cùng giáo viên:

- Lớp A: Thứ 2, 09:00-10:00 và 13:00-14:00, áp dụng từ 07/09/2026.
- Lớp B: Thứ 2, 11:00-12:00, áp dụng từ 07/09/2026.

Mỗi ca bên dưới độc lập; thu hồi dữ liệu thử trước khi chuyển sang ca khác nếu cần.

| Ca | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| 1 | Tạo lịch cố định A 11:30-12:30 Thứ 2 | Chặn, hiện tên B, ngày và giờ trùng |
| 2 | Tạo lịch cố định A 10:00-11:00 Thứ 2 | Cho lưu, chạm biên không trùng |
| 3 | Nhập hai ca cùng thứ 09:00-10:00 và 09:30-10:30 | Chặn các ca trong cùng bản nháp |
| 4 | Version B 11:00-12:00 kết thúc 06/09, A áp dụng từ 07/09 | Không báo trùng version B đã hết hiệu lực |
| 5 | B có version trùng mới bắt đầu năm 2028, A áp dụng vô thời hạn | Vẫn phát hiện trùng trong tương lai |
| 6 | Khoảng hiệu lực giao nhau nhưng không chứa thứ có ca trùng | Không báo trùng giả |
| 7 | A đã có version từ 21/09; thêm version từ 14/09 | Version mới chỉ có hiệu lực 14-20/09, giữ version 21/09 |
| 8 | B có buổi thêm trùng lịch cố định mới của A | Hiện cảnh báo chi tiết; chỉ lưu khi xác nhận |
| 9 | Dời tiết A ngày 07/09 từ 09:00-10:00 sang 09:30-10:30 cùng ngày | Cho lưu: không check với tiết gốc |
| 10 | Dời cùng tiết A sang 10:30-11:30 | Chặn vì trùng B, dù đã bỏ tiết gốc |
| 11 | Dời tiết A sang 13:30-14:30 | Chặn vì trùng tiết khác của A |
| 12 | Dời tiết A từ 07/09 sang 14/09 cùng giờ | Chặn vì trùng tiết của tuần kế tiếp; không loại trừ cả chuỗi cố định |
| 13 | Lưu lại lịch tạm hiện có, giữ nguyên ngày/giờ | Không tự báo trùng chính override đang sửa |
| 14 | Sửa lịch tạm sang giờ đã có một buổi thêm khác | Chặn bởi buổi thêm khác |
| 15 | Cho nghỉ tiết A 09:00-10:00 ngày 07/09, thêm tiết B vào giờ đó | Cho phép; lịch hủy không chiếm giờ |
| 16 | Sau ca 15, thu hồi lịch nghỉ của A | Chặn vì tiết gốc A được khôi phục sẽ trùng B |
| 17 | Dời tiết sáng A sang ngày khác | Tiết 13:00-14:00 cùng ngày vẫn hiện trên calendar/điểm danh |
| 18 | Lịch dời cũ thiếu giờ gốc, ngày gốc có nhiều tiết | Phải chọn tiết gốc cụ thể, không tự bỏ qua toàn bộ ngày |
| 19 | Ca 05:00-06:00 Thứ 2 | Hiện/check đúng Thứ 2 giờ VN dù DB lưu Chủ nhật UTC |
| 20 | Hai giáo viên có cùng giờ | Không báo trùng và không lộ lịch của giáo viên kia |
| 21 | Gọi API ghi trực tiếp với payload trùng, bỏ qua API check | Backend trả 409, không tạo/sửa lịch |
| 22 | Hai tab cùng gửi lưu lịch | Yêu cầu đang ghi giữ khóa theo giáo viên; yêu cầu còn lại nhận thông báo thử lại |
| 23 | Chọn Tìm giờ trống, giới hạn 06:00-22:00, thời lượng 90 phút | Chỉ trả khoảng đủ 90 phút; bấm khoảng sẽ điền giờ bắt đầu và kết thúc |
| 24 | Tìm giờ trống khi đang dời tiết | Tiết gốc được bỏ qua, các tiết khác vẫn chiếm giờ |
| 25 | Thu nhỏ màn hình 768/390/320px, mở form và tìm giờ trống | Form không tràn ngang; nội dung dài cuộn trong modal, các nút vẫn thao tác được |
| 26 | Bấm lưu rồi hủy modal xác nhận | Không có yêu cầu tạo/sửa gửi đến API |
| 27 | Thay đổi giờ hoặc đóng form khi API check còn đang trả lời | Bỏ kết quả kiểm tra cũ; không mở xác nhận cho dữ liệu đã đổi |

## Kiểm tra tự động

Trong `edutrack_be`:

```powershell
node node_modules/jest/bin/jest.js --runInBand
npm run build
```

Trong `edutrack_fe`:

```powershell
npm run lint
npm run build
```

Smoke test giao diện dùng Chrome riêng, giả lập tất cả API, không dùng phiên đăng nhập hay database thật. Cần FE chạy ở `http://localhost:3002` và BE đã build:

```powershell
# edutrack_be
node test/schedule-ui-smoke.cjs
```

Ảnh chụp và báo cáo được tạo trong `.schedule-qa` ở thư mục workspace. Script đọc `EDUTRACK_CHROME_EXECUTABLE_PATH` nếu Chrome không nằm ở đường dẫn mặc định Windows.
