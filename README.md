# Đảo Đèn Lồng — Phase 1

Game 3D phong cách low-poly/cổ tích: Mây thu đom đóm, thắp 5 Đèn Lồng Lớn và xua Bóng Mực khỏi Đảo Bến.

## Chạy

Yêu cầu Node.js 18+.

```bash
npm test
npm start
# mở http://localhost:8080
```

## Điều khiển

- `WASD`: di chuyển Mây trên đảo.
- `Q`: nhảy.
- `E`: nạp toàn bộ số đom đóm có thể vào Đèn Lồng Lớn gần nhất.
- `Space`: tỏa sáng, tốn 1 đom đóm và làm choáng Bóng Mực trong phạm vi 6 m.
- `R`: chơi lại.

## Luật và tính điểm

Mỗi đèn cần 3 đom đóm. Nhặt một đom đóm: 10 điểm; thắp một đèn: 100 điểm; làm choáng một Bóng Mực: 20 điểm. Khi thắng, cộng 1 điểm mỗi giây còn lại và 50 điểm mỗi lửa/máu còn lại. Bóng Mực làm Mây mất một lửa; 50% đom đóm đang mang bị rơi (làm tròn xuống). Thắp cả 5 đèn để thắng; hết lửa hoặc hết đêm thì thua.

## Headless / Test Contract

`game.contract.json` khai báo chính xác các số dùng bởi mô phỏng. Ví dụ:

```bash
node headless.js --seed 42 --night 1 --scenario examples/pickup.json --inputs examples/pickup-inputs.json --ticks 180 --out proof.jsonl
```

Lệnh chạy ở 60 tick/giây mô phỏng, không mở cửa sổ/GPU. Cùng seed, scenario và input luôn sinh JSONL giống hệt. Input/scenario sai định dạng trả mã thoát `2`.

## Sáng tạo của tôi

Đảo được trình bày như một mặt phẳng phối cảnh 3D ban đêm: đèn sáng tạo quầng vàng cam và khu vực an toàn, trong khi Bóng Mực tím đen truy đuổi Mây. Các yếu tố trang trí chỉ tồn tại ở giao diện; chúng không thay đổi simulation/headless output.

## Tài liệu Phase 1

- [Giả định](docs/notes/phase-1-assumptions.md)
- [Nhật ký AI và retro](docs/notes/phase-1-ai-log.md)
- [Bằng chứng kiểm chứng](docs/proof/phase-1.md)

## Tài liệu Phase 3

- [Giả định và quyết định](docs/notes/phase-3-assumptions.md)
- [ADR-003: Đèn có nhiên liệu và thắng lúc bình minh](docs/notes/ADR-003-lantern-fuel.md)
- [Nhật ký AI và retro](docs/notes/phase-3-ai-log.md)
- [Bằng chứng kiểm chứng](docs/proof/phase-3.md)
- [Changelog Phase 3](CHANGELOG.md)

## Credits / License

Toàn bộ hình vẽ canvas, âm thanh (không sử dụng), mã nguồn và asset hình học được tự tạo cho lab. Xem [LICENSE](LICENSE).
