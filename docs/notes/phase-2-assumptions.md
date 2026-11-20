# Phase 2 — Giả định và quyết định thiết kế

1. Đêm 1, 2, 3 lần lượt dùng 5, 6, 7 đèn và thời lượng tăng dần để độ khó
   tăng theo số mục tiêu cần bảo vệ.
2. Dash chỉ khởi phát ở cạnh nhấn phím, kéo dài ngắn và có hồi chiêu. Điều này
   ngăn việc giữ phím tạo vận tốc vô hạn và giúp đầu vào headless xác định.
3. Charm chỉ xuất hiện ở Đêm 2 và 3. Khi nhặt, hiệu ứng có thời hạn hữu hạn;
   các giá trị thời gian được đếm bằng tick thay vì đồng hồ hệ thống.
4. Drifter chỉ hoạt động từ Đêm 2, chỉ có thể lấy đom đóm khi người chơi mang
   đủ ngưỡng, và số Drifter đồng thời bị giới hạn để không làm hỏng độ khó.
5. Gió chỉ áp dụng ở Đêm 3, hoạt động theo chu kỳ tick cố định. Hướng gió được
   suy ra từ `simTick`, không dùng `Math.random` hay thời gian thực.
6. Mote và Shade phát sinh định kỳ theo RNG có seed của simulation. Scenario
   có thể đặt `random_motes: false` và `random_shades: false` để test cô lập.
7. Snapshot giữ các trường `wind`, `dash_cd_s`, `charm_s`, `drifters` và
   `charms` để client và headless quan sát cùng một trạng thái.
