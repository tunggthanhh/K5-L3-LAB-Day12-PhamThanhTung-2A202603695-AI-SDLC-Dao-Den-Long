# Nhật ký AI — Phase 3

## Ticket-03: "Đèn cạn dầu"

### AI đã làm gì

- AI (Antigravity/Claude) phân tích toàn bộ codebase Phase 1–2 trước khi implement.
- Sinh code cho: `lantern.js` (sửa `nearest()` để include đèn sáng chưa đầy), `game.js` (fuel decay, lantern_out, refuel, shade drain state machine, shade push khi refuel ≥ 30, dawn win condition), `app.js` (fuel bar, colorblind mode).
- Sinh bộ test 17 assertion cho Phase 3.
- Sinh tài liệu: phase-3-assumptions.md, phase-3.md (proof), cập nhật CHANGELOG.

### Lỗi AI và cách phát hiện

| Lỗi | Cách phát hiện | Sửa |
|---|---|---|
| `nearest()` chỉ lọc `!l.lit`, không nhận đèn sáng để refuel | Code review + logic | Sửa filter để include `l.lit && l.fuel < max` |
| Stun recovery → `"chase"` thay vì `"wander"` | Code review + Test 15 | Đổi thành `"wander"` |
| `ever_lit` không được set khi đèn tắt do decay/drain | Test 3c fail | Thêm `lantern.ever_lit = true` vào cả 2 chỗ lantern_out |
| Test 6c sai vì không reset `prev.interact` | Test 6a-c fail | Thêm bước `sim.step({ interact: false })` |
| Test 14 sai vì fuel bị decay trước khi finish() | Test 14 fail | Sửa test để dùng fuel thực tế sau decay |
| Test 7 có `sim ?` trước khai báo (reference error) | Runtime error | Viết lại test 7 sạch hơn |

### Phân tích token

- Phiên Phase 3: ~35k token (đọc toàn bộ codebase + 7 vòng debug)
- Tiết kiệm: đọc file song song, không regenerate code đã đúng

### Retro

- Tách simulation logic khỏi render tiếp tục phát huy hiệu quả.
- Test-driven approach: viết test trước, chạy, debug → đảm bảo không có "claim không có bằng chứng".
- Nếu làm lại: thêm test unit cho `nearest()` riêng lẻ trước khi tích hợp vào game.js.

