# 150㎡ 装修设计图

南向四室两厅两卫（15.00m × 10.00m，套内 150㎡）的方案图册：平面布置、灯具布置、空间效果、材料与家具清单。

站点发布后见：

https://xakjdxczy.github.io/image-processor/

## 本地预览

```bash
python3 -m http.server 8080
```

打开 `http://localhost:8080/`。

## 图册内容

- `index.html` — 设计图册
- `assets/plans/floorplan.svg` — 1:50 平面布置图（房间铺满 150㎡）
- `assets/plans/lighting.svg` — 灯具布置图
- `assets/renders/` — 客厅、餐厨、玄关、主卧、主卫、书房、次卧、材料色板、3D 去顶户型
- `assets/js/walkthrough.js` — 全景漫游：第一人称环视，点击地面 / WASD 走到任意位置
- `assets/js/dollhouse.js` — 写实去顶户型鸟瞰
- `scripts/build_floorplan.py` — 重新生成平面图

风格：现代轻奢原木。效果图是方案意向，施工前需按现场墙体、承重和管井深化。
