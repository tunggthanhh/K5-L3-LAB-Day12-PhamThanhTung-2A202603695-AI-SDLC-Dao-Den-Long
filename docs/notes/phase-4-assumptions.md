# Phase 4 — Giả định và quyết định phát hành

1. Benchmark và soak test chạy bằng seed cố định để kết quả có thể tái lập;
   số liệu hiệu năng vẫn phụ thuộc máy chạy và chỉ được dùng như bằng chứng
   trên môi trường đã ghi trong proof.
2. Soak test hoàn thành khi chạy đủ 10 đêm, không crash và bộ nhớ cuối không
   vượt ngưỡng được khai báo trong `soak.js`.
3. Leaderboard chỉ lưu tối đa 10 mục, sắp xếp giảm dần theo điểm và export qua
   CLI để dễ kiểm tra không cần mở trình duyệt.
4. Tuỳ chọn accessibility được lưu ở lớp giao diện; chúng không làm thay đổi
   các quy tắc mô phỏng hay kết quả headless.
5. Contract v1.3 bổ sung các lệnh benchmark và soak, nhưng giữ JSONL test
   contract tương thích với runner hiện có.
