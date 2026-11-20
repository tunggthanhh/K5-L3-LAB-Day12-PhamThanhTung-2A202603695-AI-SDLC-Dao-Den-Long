# Bằng chứng kiểm chứng — Phase 2

## Phạm vi Ticket-02

Phase 2 mở rộng mô phỏng có sẵn bằng ba đêm chơi, lướt gió, bùa chú,
Drifter và gió ở Đêm 3. Bằng chứng JSONL được lưu ngay tại root repository:

- `phase2-map.jsonl`: snapshot khởi tạo của Đêm 2 với 6 đèn.
- `phase2-check.jsonl`: snapshot và sự kiện `night_start` của một lượt chạy
  kiểm tra Đêm 2.

## Cách chạy lại

```bash
node headless.js --seed 42 --night 2 --ticks 180 --out phase2-rerun.jsonl
node headless.js --seed 42 --night 3 --ticks 480 --out phase2-night3-rerun.jsonl
```

Mở hai tệp JSONL kết quả và kiểm tra snapshot đầu tiên cùng các event trong
quá trình chạy. Headless runner dùng cùng `game.js` với trình duyệt, do đó
đây là kiểm chứng cho đúng lõi mô phỏng, không phải một bản triển khai riêng.

## Hạng mục được đối chiếu

| Hạng mục | Nơi kiểm tra | Kết quả mong đợi |
|---|---|---|
| Ba đêm chơi | `--night 1`, `--night 2`, `--night 3` | Headless chấp nhận cả ba giá trị; snapshot có trường `night`. |
| Bản đồ Đêm 2 | `phase2-map.jsonl` | Snapshot đầu có 6 lantern (`L1`–`L6`). |
| Lướt gió | Event JSONL khi input `dash` chuyển từ tắt sang bật | Event `dash`; snapshot có `player.dash_cd_s`. |
| Bùa chú | Snapshot/event khi Mây chạm charm | Event `charm_picked` và `player.charm_s`. |
| Drifter | Lượt chạy Đêm 2 hoặc 3 khi Mây mang đủ đom đóm | Event `drifter_steal`, kèm `drifter_id`. |
| Gió Đêm 3 | Snapshot Đêm 3 trong khoảng tick hoạt động | `wind.active: true` và `wind.dir_deg`. |
| Tính tái lập | Chạy cùng seed, night và input hai lần | Hai tệp JSONL giống nhau từng dòng. |

## Lưu ý về lịch sử bàn giao

Các tệp trên là bằng chứng đầu ra được lưu trong repository. Khi chấm theo
tag, cần checkout chính tag `phase-2` rồi chạy lại các lệnh trên để bằng chứng
khớp chính xác với commit bàn giao. Không thay thế tệp JSONL bằng dữ liệu sửa
tay.
