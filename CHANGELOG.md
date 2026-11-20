# Changelog

## Phase 3 — Breaking changes (Ticket-03 "Đèn cạn dầu")

- Contract nâng từ v1.1 lên v1.2.
- Đèn sáng không còn bất biến; có fuel và có thể tắt.
- `all_lit` không còn là lý do thắng; thay bằng `dawn_survived`.
- Thắng khi hết giờ (bình minh) và ≥ `ceil(0.6 × tổng đèn)` đèn đang sáng.
- Thua cuối đêm nếu thiếu đèn → reason `dawn`; hết lửa → `no_flames`.
- Shade có thêm trạng thái `drain`: tìm đèn fuel < 30, hút 5 fuel/s.
- Đèn fuel < 30 mất vùng an toàn (safe zone).
- Stun recovery → `wander` (không phải `chase`).
- Sức chứa tăng dần: 10 + 2 × successfulLights, tối đa 20.
- Toàn bộ công thức điểm thay đổi (xem Ticket-03 §5).
- Snapshot v1.2 thêm `fuel`, `ever_lit`, `relit_count` cho đèn; `capacity` cho player; trạng thái `drain` cho shade.
- Sự kiện mới: `refuel`, `lantern_out`, `fuel_drain`.
- `lantern_lit` thêm field `relight: true|false`.
- Chế độ mù màu (phím C): bảng màu dễ phân biệt, fuel bar trên đèn.
- `lantern.js` `nearest()`: nhận cả đèn sáng chưa đầy dầu (refuel).
- Night duration: 240/270/300s (đã áp dụng từ Phase 2, giữ nguyên).

## Phase 2 (Ticket-02)

- Thêm Dash (Shift), Charm pickup, Drifter, map Night 1–3.
- Shade spawn tự động, giới hạn theo đêm.
- Hệ thống Wind (Night 3).
- Thêm `phase2-check.jsonl` và `phase2-map.jsonl` làm bằng chứng.

