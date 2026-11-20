# Changelog

Mọi thay đổi quan trọng trong dự án **Đảo Đèn Lồng (Lantern Island)** được ghi lại tại đây.

---

## [v1.0.0] - Phase 4: Phát hành & Tối ưu hóa (Non-functional & Release)

### Added
- **Chế độ Benchmark (`bench.js`)**: Lệnh `node bench.js --seed 42 --duration 30 --out bench.json` kiểm tra tải nặng (200 Bóng Mực, 100 đom đóm, camera orbit 360°, xuất file `bench.json` chuẩn v1.3).
- **Soak Test (`soak.js`)**: Lệnh `node soak.js --seed 7 --nights 10 --out soak.json` chạy 10 Đêm liên tiếp, kiểm tra rò rỉ bộ nhớ RSS (`mem_end_mb <= 1.2 * mem_start_mb`).
- **Bảng xếp hạng cục bộ (Leaderboard)**: Lưu trữ file `leaderboard.json`, cho phép nhập tên sau khi thắng/thua, hỗ trợ lệnh xuất CLI `node server.js --export-leaderboard out.json`.
- **Hệ thống Trợ năng (Accessibility)**:
  - Đổi phím (Key rebinding) 9 hành động, phát hiện trùng phím, khôi phục mặc định.
  - Phụ đề (Subtitles) & Mũi tên chỉ hướng kẻ địch ở mép màn hình.
  - Cảnh báo gió bão, đếm ngược 10 giây cuối, cảnh báo đèn cạn dầu.
  - Tùy chọn "Giảm chuyển động" (Reduced motion) tắt rung camera và nhấp nháy.
  - Tùy chọn "Cỡ chữ lớn" (×1.25, $\ge 18\text{ px}$ ở 1280×720).
- **Test Suite Phase 4 (`tests/phase4-release.js`)**: 20 assertions kiểm chứng tự động toàn bộ yêu cầu phát hành.
- **Tài liệu**: Bản hồi tưởng toàn diện 4 phase (`docs/notes/retro-full.md`) và bằng chứng kiểm chứng Phase 4 (`docs/proof/phase-4.md`).

### Changed
- Nâng cấp **Test Contract** lên phiên bản `v1.3` (bổ sung `bench_cmd` và `soak_cmd`).

---

## [Phase 3] - Change Request: "Đèn cạn dầu" (Ticket-03)

### Added
- Cơ chế Nhiên liệu đèn: Nhiên liệu tối đa 100, hao 1.0/s khi thắp, tắt khi fuel $\le 0$ (`lantern_out`).
- Cơ chế Châm dầu (`refuel`): Bấm Tương tác [E] tại đèn sáng chưa đầy.
- Thắp lại (`relight`): Đèn từng sáng (`ever_lit`) chỉ tốn 5 đom đóm thay vì 10.
- Kẻ địch hút dầu: Bóng Mực có trạng thái mới `drain`, hút 5 fuel/s khi đèn yếu (`fuel < 30`).
- Đèn yếu (`fuel < 30`) mất vùng an toàn 6m; châm dầu lên $\ge 30$ đẩy lùi Bóng Mực.
- Điều kiện thắng mới: `dawn_survived` khi bình minh tới và số đèn sáng $\ge \lceil 0.6 \times \text{tổng đèn} \rceil$.
- Sức chứa tăng dần: $10 + 2 \times \text{successful\_lights}$ (tối đa 20).
- Hệ thống tính điểm mới theo Ticket-03.
- Chế độ Mù Màu: Phím `C` đổi viền mắt Bóng Mực sang Cyan `#00B3FF`, icon cảnh báo `⚠`.
- Tài liệu kiến trúc ADR-003 (`docs/notes/ADR-003-lantern-fuel.md`).

### Changed
- Contract nâng cấp lên `v1.2`.
- Bỏ cơ chế thắng sớm `all_lit`.

---

## [Phase 2] - Mở rộng thế giới & Kẻ địch (Ticket-02)

### Added
- Màn chơi Đêm 2 (6 đèn) và Đêm 3 (7 đèn).
- Kỹ năng Lướt gió (Dash) bằng phím Shift.
- Bùa chú tăng tốc độ và hồi chiêu lướt (Charms).
- Kẻ địch mới: Drifter rình trộm đom đóm khi Mây mang $\ge 5$ hạt.
- Cơ chế gió thổi định kỳ trong Đêm 3 (Wind).
- Sinh ngẫu nhiên Bóng Mực và đom đóm theo thời gian định kỳ.

---

## [Phase 1] - Khởi tạo & Test Contract (PRD-0)

### Added
- Lõi mô phỏng tất định Đảo Đèn Lồng trong `game.js`.
- Chế độ Headless runner `headless.js` xuất dữ liệu JSONL.
- Test Contract v1.0 trong `game.contract.json`.
- Hệ thống chuyển động, va chạm, nhảy, nhặt đom đóm, thắp đèn, tỏa sáng (Pulse).
- Smoke test kịch bản cơ bản `tests/contract-smoke.js`.
