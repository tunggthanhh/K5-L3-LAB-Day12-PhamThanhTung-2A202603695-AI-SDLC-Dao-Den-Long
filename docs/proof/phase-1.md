# Bằng chứng kiểm chứng — Phase 1

Chạy từ root repository bằng Node.js 22.18.0:

```text
> npm test
contract smoke test passed
```

Smoke test dựng scenario không có thực thể ngẫu nhiên, đặt một đom đóm trước Mây, chạy headless 20 tick, rồi xác nhận:

| Yêu cầu | Cách kiểm chứng | Kết quả |
|---|---|---|
| Snapshot tick 0 | Đọc dòng đầu JSONL | Có `type: snapshot`, `tick: 0` |
| Nhặt đom đóm | Scenario có mote ở `(0,0,1)`, Mây tiến tới | Có event `mote_picked` |
| End bắt buộc | Đọc dòng cuối JSONL | Có `type: end` |
| Headless chạy được | `node headless.js ...` | Thoát mã 0 |

Chạy lại cùng input/seed phải so sánh bằng nhau bằng lệnh:

```bash
node headless.js --seed 7 --night 1 --ticks 120 --out /tmp/a.jsonl
node headless.js --seed 7 --night 1 --ticks 120 --out /tmp/b.jsonl
cmp /tmp/a.jsonl /tmp/b.jsonl
```

Lưu ý: cần chạy lại tại tag `phase-1` sau khi gắn tag để bằng chứng khớp chính xác commit bàn giao.
