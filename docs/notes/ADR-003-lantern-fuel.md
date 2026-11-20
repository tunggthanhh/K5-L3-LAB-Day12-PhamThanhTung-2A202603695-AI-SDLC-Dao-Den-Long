# ADR-003: Đèn có nhiên liệu và thắng lúc bình minh

## Bối cảnh

Phase 3 thay luật thắng ngay khi thắp hết đèn. Đèn trở thành thực thể có
trạng thái `unlit`, `lit`, `low-fuel`, `out`; trạng thái low-fuel là `lit`
với fuel dưới 30.

## Quyết định

- Fuel được giữ trên từng đèn, tối đa 100 và giảm theo tick.
- Đèn cạn fuel chuyển `out`, reset tiến độ nạp nhưng giữ `ever_lit`.
- Đèn đã từng sáng dùng chi phí thắp lại 5; đèn mới dùng 10.
- Kết thúc chỉ xét ở bình minh, cần `ceil(0.6 × số đèn)` đang sáng.

## Hệ quả

Test thắng sớm Phase 2 không còn hợp lệ và phải thay bằng test bình minh.
Snapshot v1.2 thêm `fuel`, `ever_lit`, `relit_count`; event thêm
`refuel`, `lantern_out`, `fuel_drain`.
