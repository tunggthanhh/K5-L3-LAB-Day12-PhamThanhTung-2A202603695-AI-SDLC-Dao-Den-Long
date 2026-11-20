# Video Demo — Đảo Đèn Lồng (v1.0.0)

Hướng dẫn nộp video demo theo yêu cầu Day 12 AI SDLC:

- Định dạng: `.mp4`, thời lượng dưới 5 phút.
- Nội dung video:
  1. Chơi trực tiếp một đoạn gameplay (Bé Mây nhặt đom đóm, thắp đèn, châm dầu, dùng kỹ năng Tỏa Sáng và Lướt né Bóng Mực).
  2. Bằng chứng chạy kiểm tra: mở terminal chạy `npm test` (xanh toàn bộ 53 assertions).
  3. Bằng chứng chạy benchmark: chạy `npm run bench` (cho thấy kết quả FPS và RAM đạt chuẩn).
  4. Lướt qua phần Accessibility (Đổi phím, Chế độ Mù màu, Giảm chuyển động) và Bảng xếp hạng Top 10.
- Vị trí đính kèm:
  - Cách 1 (Khuyến nghị): Đính kèm trực tiếp vào GitHub Release `v1.0.0` bằng lệnh:
    ```bash
    gh release upload v1.0.0 demo.mp4
    ```
  - Cách 2: Lưu tệp tại `docs/demo/demo.mp4` (dưới 100 MB).
