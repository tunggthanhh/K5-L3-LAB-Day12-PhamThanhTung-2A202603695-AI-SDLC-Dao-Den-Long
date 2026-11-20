# Bằng chứng kiểm chứng — Phase 4 (Phát hành v1.0.0)

Báo cáo kết quả kiểm tra tự động và các số đo thực tế chạy trên Node.js v22.18.0 (Windows x64):

---

## 1. Kết quả Kiểm thử Tự động (Test Suites)

Lệnh thực thi:
```bash
npm test
```

Đầu ra:
```text
> dao-den-long@1.0.0 test
> node tests/contract-smoke.js && node tests/phase3-fuel.js && node tests/phase4-release.js

contract smoke test passed
phase 3 fuel test passed (33 assertions, 0 failures)
[TEST] Running Phase 4 Release Verification...
phase 4 release test passed (20 assertions, 0 failures)
```

---

## 2. Kết quả Benchmark (`bench.json`)

Lệnh thực thi:
```bash
node bench.js --seed 42 --duration 30 --out bench.json
```

Kết quả đo thực tế:

| Chỉ số | Giá trị đo được | Ngưỡng yêu cầu | Đánh giá |
|---|---|---|---|
| `avg_fps` | **80.9** FPS | $\ge 60$ FPS | ✅ ĐẠT |
| `p1_low_fps` | **67.3** FPS | $\ge 30$ FPS | ✅ ĐẠT |
| `frame_ms_p95` | **13.33** ms | -- | Mượt mà ổn định |
| `load_ms` | **123** ms | $\le 10000$ ms | ✅ ĐẠT |
| `peak_mem_mb` | **43** MB | Tối ưu | Không tốn RAM |
| `vsync_off` | **true** | true | ✅ ĐẠT |
| `frames` | **2422** | -- | Đầy đủ mẫu đo |

---

## 3. Kết quả Soak Test (`soak.json`)

Lệnh thực thi:
```bash
node soak.js --seed 7 --nights 10 --out soak.json
```

Kết quả kiểm tra tính ổn định:

| Chỉ số | Giá trị đo được | Ngưỡng yêu cầu | Đánh giá |
|---|---|---|---|
| `nights` | **10** đêm liên tiếp | 10 | ✅ ĐẠT |
| `crashes` | **0** lần crash | = 0 | ✅ ĐẠT |
| `mem_start_mb` | **39** MB | -- | Mức nền ban đầu |
| `mem_end_mb` | **43** MB | $\le 1.2 \times 39 = 46.8$ MB | ✅ ĐẠT (Không rò rỉ bộ nhớ) |
| `duration_s` | **0.2** s | Hoàn tất | Headless siêu tốc |

---

## 4. Kiểm tra Xuất Bảng Xếp Hạng (Leaderboard)

Lệnh thực thi:
```bash
node server.js --export-leaderboard out.json
```

Kết quả:
- Tạo thành công tệp `out.json` chứa trường `{"entries": [ ... ]}`.
- Đầy đủ các trường: `name`, `score`, `nights_won`, `achieved_at`, `seed`.
- Sắp xếp giảm dần theo điểm số, giữ tối đa top 10 mục.

---

## 5. Danh mục Tính năng Trợ năng (Accessibility)

- [x] **Đổi phím điều khiển (Key rebinding)**: Tùy biến 9 hành động, phát hiện trùng phím, có nút khôi phục mặc định và lưu `localStorage`.
- [x] **Phụ đề & Chỉ báo hình ảnh (Subtitles & Directional Arrows)**: Thông báo khi Bóng Mực xuất hiện (kèm mũi tên chỉ hướng mép màn hình), cảnh báo gió thổi, đếm ngược 10s cuối, cảnh báo đèn cạn dầu.
- [x] **Giảm chuyển động (Reduced Motion)**: Tùy chọn triệt tiêu rung camera (`camShake = 0`) và các hiệu ứng chớp tắt.
- [x] **Cỡ chữ UI lớn (×1.25)**: Đảm bảo độ rõ nét tối thiểu $\ge 18\text{ px}$ ở độ phân giải $1280 \times 720$.
- [x] **Chế độ Mù Màu (Colorblind Mode)**: Phím `C` chuyển sang bảng màu độ tương phản cao, mắt Bóng Mực đổi sang màu Cyan `#00B3FF`, đèn tắt có hình dáng biến dạng xẹp $20\%$.
