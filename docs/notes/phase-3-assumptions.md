# Phase 3 — Giả định và quyết định thiết kế

## Ticket-03 "Đèn cạn dầu" — Assumptions

1. **Fuel integer precision**: Fuel được tính dưới dạng số thực (float), hao theo `1/60` mỗi tick. Giá trị round về 1 chữ số thập phân chỉ khi output ra snapshot (sử dụng hàm `round()` hiện có). Điều này tránh sai số tích lũy.

2. **Thứ tự xử lý trong tick**: Decay fuel → Dash → Move → Jump → Mote pickup → Interact (thắp/châm dầu) → Pulse → Shade AI → Hit detection → Tick advance → Check win/lose. Thứ tự này đảm bảo fuel của đèn được trừ trước khi shade AI đọc trạng thái.

3. **Shade safe zone**: Chỉ đèn sáng với `fuel >= low_fuel_threshold (30)` mới tạo vùng an toàn. Đèn `fuel < 30` mất vùng an toàn hoàn toàn, shade có thể đi xuyên qua.

4. **Shade drain exit**: Shade thoát `drain` về `wander` khi: đèn tắt, fuel được châm lên ≥ 30, hoặc khoảng cách > 2m. Shade KHÔNG thoát `drain` nếu Mây vào gần — thay vào đó chuyển sang `chase`.

5. **Châm dầu khi fuel được nâng ≥ 30**: Shade trong vòng `safe_radius (6m)` của player bị đẩy ra mép vùng và nhận `stun = 30/60s`. Shade đang drain được chuyển về `wander`. Điều này đảm bảo người chơi có thể "giải cứu" đèn.

6. **Relight**: Đèn `ever_lit` chỉ cần 5 đom đóm. `ever_lit` được set `true` khi đèn thắp lần đầu, và được giữ ngay cả khi đèn tắt do hao dầu hoặc bị drain.

7. **`nearest()` cho interact**: Hàm chọn đèn nhận được là đèn **chưa sáng** HOẶC **đang sáng nhưng fuel < 100** (cần châm dầu). Đèn sáng đầy dầu không được chọn và không phát event.

8. **Score Phase 3**: Bỏ `per_second_left` (thưởng thời gian). Giữ `per_flame_left: 50`, `per_stun: 5`. Thêm +15 khi stun shade đang drain. +5 mỗi đom đóm nạp (thắp mới, thắp lại, châm dầu). +100 thắp mới, +40 thắp lại.

9. **Colorblind mode**: Lưu vào `localStorage["colorblind"]`. Phím `C` toggle. Chỉ ảnh hưởng render, không ảnh hưởng simulation/headless output.

10. **Night duration**: 240/270/300s cho Night 1/2/3 — đã có từ Phase 2, giữ nguyên.
