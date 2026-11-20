# Nhật ký AI — Phase 2

## Phạm vi hỗ trợ

- Phân rã Ticket-02 thành các thay đổi ở simulation, headless snapshot và
  giao diện.
- Rà soát yêu cầu xác định: browser và `headless.js` cùng dùng `game.js`; không
  thêm nguồn ngẫu nhiên hoặc thời gian thực vào simulation.
- Đề xuất các trường snapshot và kịch bản JSONL để quan sát dash, charm,
  Drifter và gió.

## Kiểm chứng do người thực hiện

- Chạy headless cho Đêm 2 và Đêm 3 với seed cố định.
- Lưu `phase2-map.jsonl` và `phase2-check.jsonl` làm bằng chứng đầu ra.
- Chạy lại `npm test` sau khi tích hợp các thay đổi tiếp theo.

## Ghi nhận chi phí

Số token và chi phí của phiên Phase 2 không được ghi nhận trong dữ liệu hiện
có. Không ước lượng hồi tố để tránh biến ghi chép nộp bài thành thông tin
không kiểm chứng được. Nếu hệ thống AI của bạn hiển thị usage, bổ sung số liệu
thực tế tại đây trước khi nộp.

## Bài học

Các cơ chế theo thời gian nên dựa trên tick. Cách này cho phép tái lập đầu ra
JSONL bằng seed và input giống nhau, đồng thời đơn giản hóa việc so sánh lỗi.
