# BẢN RETROSPECTIVE TOÀN DIỆN DỰ ÁN — ĐẢO ĐÈN LỒNG
**Khóa học / Kỳ thi:** Day 12 AI SDLC Lab  
**Học viên:** Phạm Thanh Tùng — MSSV: 2A202603695  
**Dự án:** Đảo Đèn Lồng (Lantern Island) — Phát hành v1.0.0 (Phase 4)

---

## 1. Tổng quan & Đánh giá (Evaluation) qua 4 Phase

| Phase | Mục tiêu | Trọng tâm | Kết quả đánh giá |
|---|---|---|---|
| **Phase 1** | Xây dựng khung nền tảng & Headless | Lõi mô phỏng tất định, Test Contract v1.0, Smoke test JSONL | Hoàn thành xuất sắc. Tách bạch 100% logic mô phỏng khỏi tầng hiển thị |
| **Phase 2** | Mở rộng tính năng | Thêm Night 2 & 3, bùa chú (Charms), kẻ địch trộm đom đóm (Drifter), cơ chế gió (Wind) | Mở rộng không làm hỏng logic cũ. Các bài test Phase 1 vẫn chạy đạt |
| **Phase 3** | Change Request "Đèn cạn dầu" | Contract v1.2, cơ chế hao dầu, Bóng Mực hút dầu (`drain`), điều kiện thắng `dawn_survived` | Xử lý triệt để breaking changes; ghi nhận ADR-003; viết bộ test 33 assertions |
| **Phase 4** | Phát hành v1.0.0 & Non-functional | Contract v1.3, Benchmark 30s, Soak test 10 đêm, Leaderboard, Trợ năng (Accessibility) | Đạt ngưỡng hiệu năng (Avg FPS ~81 > 60, P1 Low > 30), không rò rỉ bộ nhớ, phát hành v1.0.0 |

---

## 2. Đánh giá Quá trình Làm việc cùng AI

### A. Những gì hoạt động hiệu quả (What Worked)
- **Tư duy Test-Driven Development (TDD)**: Luôn xây dựng bộ kiểm thử và kịch bản Test Contract trước hoặc song song với code. Khi AI sinh code sai, test runner lập tức bắt lỗi giúp con người không bị ảo tưởng "code chạy được".
- **Kiến trúc phân tách ranh giới rõ ràng**: Việc cô lập `game.js` (không dính dáng DOM/Canvas/GPU) giúp AI tập trung vào logic toán học tất định, không làm xáo trộn kết quả mô phỏng khi cải tiến đồ họa trong `app.js`.
- **Harness hướng dẫn xúc tích (`AGENTS.md`)**: Thiết lập luật bất biến ngay từ đầu: "Không nondeterministic calls, không đổi format contract, validate exit code 2 khi input sai".

### B. Những gì không hiệu quả (What Didn't Work)
- **Lời nhắc dài dòng thiếu trọng tâm**: Khi đưa prompt quá nhiều yêu cầu cùng lúc mà không phân chia tiêu chí nghiệm thu, AI dễ bỏ sót các ràng buộc ngầm (như việc `contract_version` phải nhảy lên `1.3` hay thứ tự trừ dầu trong tick).
- **Tin tưởng vào assertion giả định**: AI có xu hướng viết test lỏng lẻo nếu không chỉ rõ kỳ vọng (ví dụ: ban đầu test so sánh fuel chưa trừ hao hụt tick cuối).

---

## 3. Phân tích các lần AI Sai & Cách Phát hiện, Phòng tránh

| Lần sai của AI | Nguyên nhân | Cách phát hiện | Cách khắc phục & Tinh chỉnh Harness |
|---|---|---|---|
| **Hàm `nearest()` bỏ qua đèn sáng chưa đầy** | AI chỉ lọc `!l.lit`, không tính đến trường hợp châm dầu (`refuel`) cho đèn đang sáng | Unit test kiểm tra sự kiện `refuel` bị fail | Viết lại hàm lọc nhận cả đèn chưa sáng hoặc sáng nhưng `fuel < fuel_max` |
| **Hồi phục choáng về nhầm trạng thái** | AI set `s.state = "chase"` thay vì `"wander"` theo luật Ticket-03 | Đối chiếu bảng trạng thái trong Ticket-03 | Đổi về `"wander"`; bổ sung test case 15 kiểm tra trực tiếp |
| **Đèn cạn dầu quên gán `ever_lit`** | Khi fuel về 0 do hao tự nhiên hoặc bị hút, AI chỉ gán `lit = false` | Test 3c `ever_lit preserved` báo lỗi | Bổ sung `lantern.ever_lit = true` tại mọi nhánh tắt đèn |
| **Timing hao dầu trước khi tính điểm bình minh** | AI so sánh điểm thưởng fuel nguyên bản trước khi tick cuối trừ 1/60 fuel | Debug run thấy điểm lệch 3 đơn vị | Cập nhật công thức tính điểm thưởng lấy theo fuel thực tế sau tick |
| **Hardcode version trong test cũ** | Test cũ kiểm tra cứng `contract_version === '1.2'` khi nâng lên `1.3` | `npm test` fail ở assertion 17 | Nâng cấp test chấp nhận version `>= 1.2` và tạo riêng `tests/phase4-release.js` |

---

## 4. Đánh giá Harness AI & Tài nguyên Sử dụng

### A. Thành phần Harness giúp ích nhiều nhất
1. **`AGENTS.md`**: Đóng vai trò kim chỉ nam, ngăn chặn AI thêm các thư viện cồng kềnh hay các hàm `Math.random` gây bất định.
2. **Deterministic PRNG Wrapper**: Hàm sinh số giả ngẫu nhiên theo seed đảm bảo mọi run đều tái lập 100%.
3. **Test Scripts tự động hóa (`npm test`, `bench.js`, `soak.js`)**: Giúp phản hồi ngay lập tức trong vòng 2-3 giây sau mỗi lần chỉnh sửa.

### B. Ước tính Token & Chi phí Toàn Dự án
- **Tổng lượng token ước tính**: ~75,000 token qua cả 4 phase.
- **Chiến lược tiết kiệm token đã áp dụng**:
  - Không đọc lại các file mã nguồn đã kiểm tra và không đổi.
  - Sử dụng lệnh batch edits và batch commands song song (`&&`, `;`).
  - Phân tách rõ ràng giữa file logic và file visual, tránh việc sinh lại mã giao diện khi chỉ sửa simulation.

---

## 5. Bài học Kinh nghiệm (Nếu làm lại từ đầu)

1. **Khởi tạo Test Contract Schema chặt chẽ từ Phase 0**: Định nghĩa JSON schema cho contract và output snapshot từ đầu để tự động validate bằng script thay vì kiểm tra thủ công.
2. **Tách riêng module Benchmark & Soak test ngay từ đầu**: Giúp theo dõi biến động hiệu năng sau từng phase thay vì chỉ dồn vào Phase 4.
3. **Thiết lập CI/Pre-commit Hook**: Tự động chạy `npm test` trước mỗi commit để tránh tình trạng tag nhầm commit lỗi.

