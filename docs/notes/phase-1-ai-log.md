# Nhật ký AI — Phase 1

- AI hỗ trợ thiết kế cấu trúc game dùng chung một mô phỏng tất định cho browser và headless, viết code ban đầu và smoke test.
- Con người kiểm tra quy tắc tick, chạy `npm test`, và đọc JSONL đầu ra. Một lỗi tiềm năng về thời gian scenario và tick `game_over` đã được phát hiện khi review contract và sửa trước khi lưu bằng chứng.
- Chiến lược tiết kiệm token: không dùng engine/phụ thuộc lớn; chia theo lõi simulation, CLI, smoke test, rồi giao diện canvas. Ước tính phiên hỗ trợ Phase 1: dưới 20k token.

## Retro ngắn

Tách simulation khỏi giao diện giúp kiểm thử đúng yêu cầu tự động sớm. Nếu làm lại, sẽ thêm nhiều test unit hơn cho va chạm và parser thay vì chỉ smoke test. Không dùng claim "đạt" nếu chưa có output test đi kèm.
