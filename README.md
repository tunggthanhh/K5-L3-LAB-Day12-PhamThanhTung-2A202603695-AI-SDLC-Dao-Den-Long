# ĐẢO ĐÈN LỒNG — Lantern Island (v1.0.0)

> 📹 **Video Demo**: [docs/demo/demo.mp4](docs/demo/demo.mp4) (hoặc xem trực tiếp tại GitHub Release [v1.0.0](../../releases/tag/v1.0.0))  
> 🏷️ **Bản phát hành**: `v1.0.0` · **Tags**: `phase-1`, `phase-2`, `phase-3`, `phase-4`  
> 📜 **Test Contract**: `v1.3` (Kèm Benchmark & Soak Test chuẩn)

---

## 1. Giới thiệu & Cốt truyện

**Đảo Đèn Lồng (Lantern Island)** là tựa game 3D phiêu lưu phong cách *Stylized Fantasy / Low-Poly Cozy Adventure*. Người chơi vào vai cô bé **Mây** đội nón lá Việt Nam, thu thập những hạt đom đóm thần kỳ giữa biển mây huyền ảo, thắp sáng và duy trì 5 Đèn Lồng Cổ Kính, đẩy lùi bầy Bóng Mực nguy hiểm để bảo vệ Đảo Bến an toàn tới khi bình minh ló rạng.

```text
       ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️
                 🏮 [ĐÈN LỚN]               🌙 (Trăng Đêm)
                      |
        👾          ( ĐẢO BẾN )         ✨ [Đom Đóm]
      (Bóng Mực)      /       \
                     /   👒    \
            🏮 [ĐÈN]   (MÂY)    🏮 [ĐÈN]
       ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️ ☁️
```

---

## 2. Cài đặt & Khởi động (Tối đa 3 lệnh)

Yêu cầu: **Node.js 18+** (không cần cài thêm dependency nặng hay thư viện ngoài).

```bash
# Lệnh 1: Kiểm tra kiểm thử tự động
npm test

# Lệnh 2: Khởi động server game
npm start

# Lệnh 3: Mở trình duyệt và trải nghiệm ngay
# http://localhost:8080
```

---

## 3. Điều khiển & Phím tắt

| Hành động | Phím mặc định | Tùy biến (Rebinding) | Chức năng |
|---|---|---|---|
| **Di chuyển** | `W` `A` `S` `D` | Có hỗ trợ | Điều khiển bé Mây chạy quanh đảo |
| **Nhảy** | `Q` | Có hỗ trợ | Nhảy tránh né, nón lá hất nhẹ |
| **Lướt gió (Dash)** | `Shift` | Có hỗ trợ | Tăng tốc độ tức thì trong 0.2s |
| **Tương tác / Nạp** | `E` | Có hỗ trợ | Nạp đom đóm thắp đèn hoặc châm thêm dầu |
| **Tỏa Sáng (Pulse)** | `Space` | Có hỗ trợ | Tốn 3 đom đóm, tạo sóng hào quang đẩy lùi Bóng Mực trong 6m |
| **Tạm dừng** | `P` / `Esc` | Có hỗ trợ | Tạm dừng hoặc tiếp tục màn chơi |
| **Chế độ Mù Màu** | `C` | Phím tắt nhanh | Bật/tắt bảng màu dễ nhận biết (Cyan `#00B3FF`, icon `⚠`) |
| **Chơi lại** | `R` | Phím tắt nhanh | Khởi tạo lại màn chơi ngay lập tức |

---

## 4. Chế độ Kiểm thử & Đo lường Hiệu năng (Phase 4)

### A. Chạy toàn bộ Test Suites
```bash
npm test
```
*Chạy smoke test hợp đồng, test logic Phase 3 (33 assertions) và test phát hành Phase 4 (20 assertions).*

### B. Chế độ Headless Runner
```bash
node headless.js --seed 42 --night 1 --ticks 180 --out proof.jsonl
```
*Chạy mô phỏng không mở màn hình, bảo toàn tính tất định 100%.*

### C. Chế độ Benchmark (Ticket-04)
```bash
npm run bench
# Hoặc: node bench.js --seed 42 --duration 30 --out bench.json
```
*Khởi tạo cảnh tải nặng (200 Bóng Mực, 100 đom đóm, camera quay vòng 360°), đo FPS trong 30s. Lần đo gần nhất: **Avg FPS 79.9 > 60**, **P1 Low 41.9 > 30**, **Load time: 126ms <= 10000ms**.*

### D. Chế độ Soak Test 10 Đêm (Ticket-04)
```bash
npm run soak
# Hoặc: node soak.js --seed 7 --nights 10 --out soak.json
```
*Chạy liên tục 10 đêm trong 1 tiến trình để kiểm tra rò rỉ bộ nhớ. Kết quả: **0 crashes**, **mem_end <= 1.2 * mem_start**.*

### E. Xuất Bảng Xếp Hạng (Leaderboard Export)
```bash
node server.js --export-leaderboard leaderboard_export.json
```
*Xuất top 10 điểm số ra tệp JSON đúng định dạng `{"entries": [ ... ]}`.*

---

## 5. Tính năng Trợ năng (Accessibility)

- **Đổi phím điều khiển (Key Rebinding)**: Cho phép gán lại phím cho cả 9 thao tác di chuyển và kỹ năng, tự động phát hiện trùng phím và lưu cấu hình vào `localStorage`.
- **Phụ đề & Mũi tên cảnh báo (Subtitles & Directional Arrows)**:
  - Thông báo khi Bóng Mực xuất hiện kèm mũi tên chỉ hướng mép màn hình.
  - Cảnh báo gió bão thổi (Đêm 3).
  - Đếm ngược to rõ ràng trong 10 giây cuối.
  - Cảnh báo khi Đèn Lớn cạn dầu (`fuel < 30`).
- **Tùy chọn Giảm chuyển động (Reduced Motion)**: Tắt rung màn hình (`camShake = 0`) và loại bỏ các hiệu ứng chớp tắt.
- **Tùy chọn Cỡ chữ lớn (×1.25)**: Đảm bảo cỡ chữ $\ge 18\text{ px}$ ở độ phân giải chuẩn $1280 \times 720$.

---

## 6. Sáng tạo của tôi — Nghệ thuật & Trải nghiệm thị giác

- **Bé Mây Chibi Đậm Nét Văn Hóa**: Thiết kế Chibi phong cách anime dễ thương (1:2.8), đội **Nón Lá Việt Nam** cách điệu với vân dệt xoắn ốc, khăn choàng vàng bay theo gió, túi đom đóm bên hông phát sáng lung linh.
- **Thế giới 3D Đảo Bến**: Vách đá tự nhiên xếp tầng, thảm cỏ rêu, đường đất nối 5 ngọn đèn, cây cổ thụ uốn lượn phong cách Ghibli, biển mây bồng bềnh và ngàn sao đêm lấp lánh.
- **5 Đèn Lồng Lớn Cổ Kính**: Đế hoa sen đá bát giác, cột gỗ sơn son, mái ngói cong Á Đông với đỉnh hồ lô vàng và chuông gió đung đưa; có thanh **3D Floating Fuel Bar** hiển thị chính xác % dầu còn lại.
- **Camera Third-Person 3D**: Chuyển động bám sát mượt mà (smooth damping), hỗ trợ rung camera khi va chạm hoặc khi Tỏa Sáng.
- **Bảng Xếp Hạng Top 10**: Tích hợp màn hình xem điểm cao từ menu chính và form nhập tên anh hùng khi hoàn thành màn chơi.

---

## 7. Tài liệu & Bằng chứng kiểm chứng

- [Tài liệu & Bằng chứng Phase 1](docs/proof/phase-1.md)
- [Tài liệu Kiến trúc ADR-003 (Nhiên liệu đèn)](docs/notes/ADR-003-lantern-fuel.md)
- [Tài liệu & Bằng chứng Phase 3](docs/proof/phase-3.md)
- [Bằng chứng Kiểm chứng Phase 4 (Benchmark & Soak Test)](docs/proof/phase-4.md)
- [Bản Hồi tưởng Toàn diện Dự án (Retrospective)](docs/notes/retro-full.md)
- [Lịch sử Thay đổi (Changelog)](CHANGELOG.md)

---

## 8. Bản quyền & Nguồn gốc (Credits & License)

Toàn bộ mã nguồn, shader, renderer 3D diorama canvas và tài nguyên hình học được tự tạo cho bài thi Day 12 AI SDLC. Xem chi tiết tại [LICENSE](LICENSE) và [CREDITS.md](CREDITS.md).
