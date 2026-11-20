# Nhật ký AI — Phase 4

## Phạm vi hỗ trợ

- Rà soát các yêu cầu phát hành: benchmark, soak test, leaderboard,
  accessibility, contract v1.3 và test hồi quy.
- Hỗ trợ tổ chức test release thành `tests/phase4-release.js` và đối chiếu
  đầu ra `bench.json`, `soak.json` với proof Phase 4.
- Nhắc kiểm tra tính xác định của simulation và giữ `game.js` là lõi dùng
  chung cho browser/headless.

## Kiểm chứng do người thực hiện

```bash
npm test
npm run bench
npm run soak
node server.js --export-leaderboard leaderboard_export.json
```

Kết quả đo và các ngưỡng đánh giá được ghi tại
[`../proof/phase-4.md`](../proof/phase-4.md).

## Ghi nhận chi phí

Số token và chi phí phiên Phase 4 không có trong dữ liệu hiện tại nên không
được điền suy đoán. Bổ sung usage thực tế từ công cụ AI, nếu có, trước khi nộp.

## Bài học

Kiểm chứng phát hành cần bao gồm cả đầu ra chức năng lẫn khả năng lặp lại của
công cụ đo. Tách benchmark/soak thành CLI giúp người chấm chạy lại mà không
phụ thuộc giao diện đồ họa.
