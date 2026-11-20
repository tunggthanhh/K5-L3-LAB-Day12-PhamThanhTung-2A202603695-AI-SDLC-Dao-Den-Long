# ĐẢO ĐÈN LỒNG — Lantern Island

Game 3D phong cách Stylized Fantasy / Low-poly Cozy Adventure: Bé **Mây** thu thập đom đóm thần kỳ, thắp sáng và duy trì 5 Đèn Lồng Cổ Kính, đẩy lùi bầy Bóng Mực để bảo vệ Đảo Bến an toàn tới bình minh.

---

## 1. Cài đặt & Khởi động

Yêu cầu môi trường: **Node.js 18+** (không cần cài thêm dependency nặng hay thư viện ngoài).

```bash
# 1. Chạy toàn bộ test kiểm thử tự động
npm test

# 2. Khởi động server game cục bộ
npm start

# 3. Mở trình duyệt truy cập:
# http://localhost:8080
```

---

## 2. Điều khiển

| Phím | Thao tác | Mô tả |
|---|---|---|
| `W A S D` | Di chuyển | Bé Mây chạy khám phá đảo, xoay người theo hướng di chuyển |
| `Q` | Nhảy | Nhảy bật lên không trung, nón lá hất nhẹ, bóng chân co nhỏ |
| `E` | Tương tác | Nạp đom đóm vào Đèn Lớn gần nhất hoặc châm thêm dầu khi đèn sáng |
| `Space` | Tỏa Sáng | Kỹ năng sóng hào quang (tốn 3 đom đóm), đẩy lùi và làm choáng Bóng Mực trong 6m |
| `Shift` | Lướt Gió (Dash) | Tăng tốc độ né đòn tức thì |
| `C` | Chế độ Mù Màu | Chuyển sang bảng màu dễ nhận diện (mắt bóng mực Cyan, icon cảnh báo ⚠, đèn tắt biến dạng rõ) |
| `R` | Chơi lại | Khởi tạo lại màn chơi mới ngay lập tức |

---

## 3. Cấu trúc mã nguồn

```text
├── index.html               # Giao diện HUD chuyên nghiệp, Menu, Victory/Defeat Modal & Canvas
├── app.js                   # 3D Stylized Diorama Canvas Engine, Camera, Nhân vật, VFX & Presentation
├── game.js                  # Core deterministic simulation logic (không phụ thuộc browser/canvas)
├── headless.js              # Headless runner chạy kịch bản tự động theo Test Contract
├── game.contract.json       # Khai báo Test Contract v1.2 & tuning parameters
├── server.js                # Local HTTP server tĩnh siêu nhẹ
├── src/sim/
│   ├── player.js            # Tính toán di chuyển và nhảy của Mây
│   ├── lantern.js           # Luật tương tác đèn lồng và chọn đèn gần nhất
│   ├── map.js               # Tọa độ đèn lồng và bùa chú qua các đêm
│   ├── drifter.js           # Thực thể Drifter trộm đom đóm
│   └── jsonl.js             # Serializer định dạng JSONL chuẩn
├── tests/
│   ├── contract-smoke.js    # Smoke test kịch bản cơ bản
│   └── phase3-fuel.js       # Test suite 33 assertions kiểm chứng toàn diện Phase 3
└── docs/                    # Tài liệu kiến trúc, ADR-003, ghi chú AI và bằng chứng kiểm chứng
```

---

## 4. Chế độ Headless & Test Contract

Game hỗ trợ chế độ headless chạy mô phỏng không cần GPU hay giao diện, đảm bảo tính tất định 100%:

```bash
node headless.js --seed 42 --night 1 --scenario examples/pickup.json --inputs examples/pickup-inputs.json --ticks 180 --out proof.jsonl
```

- Mọi lệnh chạy cùng seed, scenario và input luôn cho ra kết quả JSONL đồng nhất từng tick.
- File đầu vào sai định dạng tự động thoát với mã lỗi `2`.

---

## 5. Sáng tạo của tôi — Nghệ thuật & Trải nghiệm thị giác

Là Senior 3D Game Developer & Technical Artist, toàn bộ phần hình ảnh đã được nâng cấp toàn diện theo phong cách **Stylized Fantasy Cozy Diorama**:

1. **Nhân vật Bé Mây (Chibi Anime Style)**:
   - Tỉ lệ Chibi dễ thương (1:2.8) với đôi mắt to tròn long lanh, má hồng ửng.
   - Chiếc **Nón Lá Việt Nam** cách điệu với chóp nón vàng ấm, vân dệt đan xen và quai nón hồng thắt nơ.
   - Trang phục áo bà ba màu kem `#F7F2E7`, quần xanh đậm `#223355`, khăn choàng cổ vàng `#FFD166` bay phấp phới theo gió.
   - **Túi đom đóm đeo hông** phát sáng rực rỡ tỷ lệ thuận với số lượng đom đóm đang mang.
   - **Đèn lồng nhỏ bên hông** đu đưa nhịp nhàng theo bước chân.
   - Hệ thống **Procedural Animation** mượt mà: nhún thở tự nhiên (idle), bước chân đánh tay so le (run), co chân và thu bóng (jump), xoay thân mượt theo hướng điều khiển.

2. **Thế giới 3D Đảo Bến (World & Environment)**:
   - **Vách đá tự nhiên 3D** nhiều tầng xếp lớp với góc cạnh bóng đổ mềm mại.
   - **Thảm cỏ xanh rêu thần tiên** xen lẫn các cụm hoa dại lung linh và đường mòn đất uốn lượn nối ra 5 ngọn đèn.
   - **Cây cổ thụ Stylized (phong cách Ghibli)** với thân cây xoắn uốn lượn và tán lá bồng bềnh.
   - **Biển mây đa tầng** trôi chầm chậm dưới đáy vực và bầu trời đêm huyền bí với hơn 120 ngôi sao lấp lánh cùng vầng trăng khuyết tỏa hào quang.

3. **5 Đèn Lồng Lớn Cổ Kính (The Five Great Lanterns)**:
   - Thiết kế đậm nét văn hóa Á Đông: Chân đế đá bát giác hoa sen, 4 cột gỗ sơn son, mái ngói cong cổ kính với đỉnh hồ lô vàng và tua rua lay động.
   - **Trạng thái chưa thắp**: Lồng giấy tối màu xám tím, khói đêm bao quanh, hiển thị tiến độ nạp.
   - **Trạng thái đã thắp**: Tỏa ánh sáng vàng cam rực rỡ, chiếu rọi mặt đất xung quanh, vẽ quầng sáng an toàn (Safe Zone 6m).
   - **Thanh 3D Floating Fuel Bar**: Hiển thị chính xác lượng nhiên liệu còn lại, nhấp nháy báo động khi dưới 30 dầu.

4. **Đom Đóm & Bóng Mực Sinh Động**:
   - **Đom đóm**: Quả cầu sáng vàng kim bay bổng hình số 8 với đôi cánh tiên mỏng manh vỗ cánh nhịp nhàng. Khi thu thập, hạt sáng lượn vòng cung bay về phía túi Mây.
   - **Bóng Mực**: Thân giọt mực đàn hồi dập dềnh (jelly squash-and-stretch), mắt tím phát sáng, xúc tu uốn lượn. Khi hút dầu (`drain`), xúc tu vươn tia đỏ cắm vào đèn lồng; khi bị làm choáng (`stunned`), mắt biến thành hình xoắn ốc với vòng sao quay tít trên đầu.

5. **Camera & VFX System**:
   - Camera Third-Person 3D mượt mà (Smooth Damping Lerp) bám sát Mây.
   - **Sóng Tỏa Sáng (Light Pulse)**: Vòng xung kích ánh sáng vàng kim mở rộng, hạt pháo hoa bụi vàng bung tỏa và rung camera (screen shake) đầy uy lực.
   - Hiệu ứng thông báo điểm bay (Floating combat text): `+10 Đom đóm`, `+100 Thắp Sáng!`, `-1 Ngọn Lửa!`.

6. **Giao diện Fantasy HUD & Screens Chuyên Nghiệp**:
   - Avatar Mây Chibi đóng khung vàng sang trọng.
   - 3 Ngọn Lửa Sinh Mệnh biểu tượng ấm áp.
   - Thanh đom đóm với progress bar trực quan `carried / capacity`.
   - Vòng theo dõi trạng thái 5 đèn lồng kèm mục tiêu đêm.
   - Interaction Prompt ngữ cảnh thông minh tự động xuất hiện khi lại gần đèn.
   - Main Menu, Victory Modal và Defeat Modal đầy đủ chức năng chơi lại.
   - Chế độ Mù Màu (phím `C`) với bảng màu tương phản cao thân thiện.

---

## 6. Cam kết An Toàn Test Contract (Contract Safety)

- Toàn bộ visual rendering, animation, camera và hiệu ứng hạt hoàn toàn nằm ở tầng presentation (`app.js`, `index.html`).
- Logic mô phỏng vật lý, quy tắc tính điểm, điều kiện thắng `dawn_survived`, điều kiện thua, va chạm và Test Contract trong `game.js`, `headless.js` được bảo toàn nguyên vẹn 100%.
- Không dùng `Math.random` trong logic gameplay, đảm bảo tính tất định hoàn hảo.

---

## 7. Tài liệu & Nhật ký

- [Tài liệu Phase 1](docs/proof/phase-1.md)
- [Tài liệu Phase 3 & ADR-003](docs/notes/ADR-003-lantern-fuel.md)
- [Bằng chứng kiểm chứng Phase 3](docs/proof/phase-3.md)
- [Changelog Chi Tiết](CHANGELOG.md)

## 8. Bản quyền (Credits & License)

Toàn bộ mã nguồn, shader/canvas visual procedural engine và giao diện được tự tạo cho Day 12 AI SDLC Lab. Xem chi tiết tại [LICENSE](LICENSE) và [CREDITS.md](CREDITS.md).
