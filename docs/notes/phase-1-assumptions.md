# Phase 1 — Giả định và quyết định

1. Mỗi Đèn Lồng Lớn cần đúng 3 đom đóm (`lantern_cost: 3`); thao tác `E` nạp nhiều nhất có thể vào một đèn gần nhất.
2. Đom đóm là tài nguyên vừa để thắp đèn vừa để pulse. Pulse chỉ kích hoạt khi Mây có ít nhất một đom đóm và hết hồi chiêu.
3. Mỗi Bóng Mực bị pulse chuyển sang `stunned` trong 3 giây và bị đẩy ra 2 m. Đèn đã sáng tạo vùng an toàn 4 m, Bóng Mực không tiến vào vùng này.
4. Va chạm giảm một lửa, có bất tử 1 giây. Đánh rơi `floor(carried * 0.5)` đom đóm; các đom đóm rơi không được tạo entity mới để giữ contract tối giản.
5. Không có rơi khỏi đảo trong Phase 1 (`fall_enabled: false`), nên không phát sự kiện `player_hit` với `by: fall`.
6. Hết 300 giây là thua với lý do `dawn`. Scenario được phép thay `time_left_s` để kiểm thử và đồng hồ sau đó giảm 1/60 mỗi tick.
7. Màn chơi mặc định có 25 đom đóm và hai Bóng Mực. Khi scenario đặt `random_motes/random_shades: false`, chỉ các entity được nêu mới tồn tại.
