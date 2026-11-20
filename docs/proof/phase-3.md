# Bằng chứng kiểm chứng — Phase 3

Chạy từ root repository bằng Node.js 22.18.0:

```text
> npm test
contract smoke test passed
phase 3 fuel test passed (33 assertions, 0 failures)
```

## Yêu cầu kiểm chứng

| Yêu cầu | Cách kiểm chứng | Kết quả |
|---|---|---|
| Fuel max 100 khi thắp mới | Test 1b: `sim.lanterns[0].fuel === 100` | ✅ |
| Fuel hao mỗi tick | Test 2: fuel < 100 sau 1 tick | ✅ |
| `lantern_out` khi fuel = 0 | Test 3a-b: drain + decay | ✅ |
| `ever_lit = true` được nhớ sau khi tắt | Test 3c | ✅ |
| Snapshot v1.2: fuel, ever_lit, relit_count, capacity | Test 4a-d | ✅ |
| Relight cost = 5 (ever_lit), fresh = 10 | Test 5a-b | ✅ |
| `refuel` event với amount và fuel | Test 6a-c | ✅ |
| Shade → `drain` khi gần đèn fuel < 30 | Test 7 | ✅ |
| `fuel_drain` event mỗi 60 tick | Test 8 | ✅ |
| Thắng: `dawn_survived` khi ≥ 3/5 đèn sáng | Test 9a-b | ✅ |
| Thua: `dawn` khi < 3/5 đèn sáng | Test 10a-b | ✅ |
| Không thắng sớm khi thắp đủ đèn | Test 11 | ✅ |
| Capacity = 10 + 2 × successfulLights, tối đa 20 | Test 12a-b | ✅ |
| Score +5 mỗi đom đóm nạp | Test 13 | ✅ |
| Dawn win bonus = flames×50 + Σ(50+floor(fuel)) | Test 14a-b | ✅ |
| Stun recovery → wander (không phải chase) | Test 15 | ✅ |
| Tính tất định: 2 lần chạy JSONL giống hệt | Test 16 | ✅ |
| contract_version = "1.2", đủ tuning fields | Test 17a-d | ✅ |

## Thay đổi breaking từ Phase 2

- `all_lit` không còn là reason thắng; thay bằng `dawn_survived`
- Đèn sáng có thể tắt khi fuel hết
- Safe zone chỉ hoạt động với đèn có fuel ≥ 30
- Shade có trạng thái `drain` mới
- `contract_version` nâng lên `1.2`

Xem chi tiết: [CHANGELOG.md](../../CHANGELOG.md) và [ADR-003](../notes/ADR-003-lantern-fuel.md).
