#!/usr/bin/env python3
"""Generate a dimensioned 150㎡ floor-plan SVG. Rooms tile 15.00m × 10.00m exactly."""

from pathlib import Path

SCALE = 52
OX, OY = 96, 82
PLAN_W, PLAN_H = 15.0, 10.0

# name, x, y, w, h, fill, english, slug
# Public living-dining is 5.40m wide × 5.80m deep so the sofa wall actually fits.
ROOMS = [
    ("厨房", 0.00, 0.00, 3.60, 2.80, "#f3d6c4", "Kitchen", "kitchen"),
    ("生活阳台", 3.60, 0.00, 1.80, 2.80, "#d9ead3", "Service balcony", "service-balcony"),
    ("玄关", 5.40, 0.00, 1.80, 2.80, "#efe6d6", "Foyer", "foyer"),
    ("书房", 7.20, 0.00, 4.80, 2.80, "#d7e4f0", "Study", "study"),
    ("次卧B", 12.00, 0.00, 3.00, 2.80, "#e4edd8", "Bedroom B", "bedroom-b"),
    ("餐厅", 0.00, 2.80, 5.40, 2.00, "#f7e6c8", "Dining", "dining"),
    ("走廊储物", 5.40, 2.80, 1.80, 5.80, "#f4efe4", "Hall / storage", "hall"),
    ("客卫", 7.20, 2.80, 2.40, 3.00, "#dde3ea", "Guest bath", "guest-bath"),
    ("衣帽间", 9.60, 2.80, 2.40, 3.00, "#efe0cc", "Walk-in closet", "wic"),
    ("次卧A", 12.00, 2.80, 3.00, 3.00, "#dce8cc", "Bedroom A", "bedroom-a"),
    ("客厅", 0.00, 4.80, 5.40, 3.80, "#f8e3c2", "Living", "living"),
    ("主卫", 7.20, 5.80, 2.40, 2.80, "#d5dce6", "Master bath", "master-bath"),
    ("主卧", 9.60, 5.80, 5.40, 4.20, "#eadcc4", "Master bedroom", "master"),
    ("南阳台", 0.00, 8.60, 7.20, 1.40, "#cfe3c8", "South balcony", "south-balcony"),
    ("主卫淋浴", 7.20, 8.60, 2.40, 1.40, "#d5dce6", "Master shower", "master-bath"),
]


def area(room):
    return round(room[3] * room[4], 2)


def px(meters):
    return round(meters * SCALE, 2)


def box(x, y, w, h):
    return OX + px(x), OY + px(y), px(w), px(h)


def verify():
    step = 0.10
    cells = {}
    overlaps = []
    for name, x, y, w, h, _fill, _en, _slug in ROOMS:
        xi = 0
        while xi < w - 1e-9:
            yi = 0
            while yi < h - 1e-9:
                key = (round(x + xi, 2), round(y + yi, 2))
                if key in cells:
                    overlaps.append((key, cells[key], name))
                cells[key] = name
                yi += step
            xi += step
    missing = []
    xi = 0.0
    while xi < PLAN_W - 1e-9:
        yi = 0.0
        while yi < PLAN_H - 1e-9:
            key = (round(xi, 2), round(yi, 2))
            if key not in cells:
                missing.append(key)
            yi += step
        xi += step
    total = round(sum(area(r) for r in ROOMS), 2)
    if overlaps:
        raise SystemExit(f"overlaps: {overlaps[:8]}")
    if missing:
        raise SystemExit(f"gaps: {missing[:8]}")
    if abs(total - 150.0) > 0.01:
        raise SystemExit(f"area {total} != 150")
    return total


def text(x, y, content, size=13, weight=600, fill="#2a241c", anchor="middle"):
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" font-weight="{weight}" '
        f'fill="{fill}" text-anchor="{anchor}" '
        f'font-family="PingFang SC, Noto Sans SC, sans-serif">{content}</text>'
    )


def dim_h(x, y, w, label):
    x1, y1 = OX + px(x), OY + px(y)
    x2 = x1 + px(w)
    return f"""
    <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y1}" stroke="#6b5a3e" stroke-width="1"/>
    <line x1="{x1}" y1="{y1-5}" x2="{x1}" y2="{y1+5}" stroke="#6b5a3e"/>
    <line x1="{x2}" y1="{y1-5}" x2="{x2}" y2="{y1+5}" stroke="#6b5a3e"/>
    {text((x1 + x2) / 2, y1 - 8, label, 11, 500, "#6b5a3e")}
    """


def dim_v(x, y, h, label):
    x1, y1 = OX + px(x), OY + px(y)
    y2 = y1 + px(h)
    return f"""
    <line x1="{x1}" y1="{y1}" x2="{x1}" y2="{y2}" stroke="#6b5a3e" stroke-width="1"/>
    <line x1="{x1-5}" y1="{y1}" x2="{x1+5}" y2="{y1}" stroke="#6b5a3e"/>
    <line x1="{x1-5}" y1="{y2}" x2="{x1+5}" y2="{y2}" stroke="#6b5a3e"/>
    <text x="{x1-9}" y="{(y1 + y2) / 2:.1f}" font-size="11" fill="#6b5a3e" text-anchor="end"
      dominant-baseline="middle" font-family="PingFang SC, Noto Sans SC, sans-serif">{label}</text>
    """


def furniture():
    parts = []

    def stroke_rect(x, y, w, h, rx=3):
        X, Y, W, H = box(x, y, w, h)
        parts.append(
            f'<rect x="{X}" y="{Y}" width="{W}" height="{H}" rx="{rx}" '
            f'fill="none" stroke="#53493c" stroke-width="1.15"/>'
        )

    def stroke_oval(x, y, w, h):
        X, Y, W, H = box(x, y, w, h)
        parts.append(
            f'<ellipse cx="{X + W / 2}" cy="{Y + H / 2}" rx="{W / 2}" ry="{H / 2}" '
            f'fill="none" stroke="#53493c" stroke-width="1.15"/>'
        )

    # Living: sofa on west, TV on east, table center — 3.80m depth
    stroke_rect(0.25, 5.15, 0.85, 2.70)
    stroke_rect(0.25, 7.00, 2.40, 0.85)
    stroke_oval(1.70, 6.20, 1.20, 0.75)
    stroke_rect(4.85, 5.50, 0.40, 2.00)
    # Dining
    stroke_oval(1.40, 3.10, 2.40, 1.30)
    # Kitchen U
    stroke_rect(0.12, 0.12, 3.36, 0.58)
    stroke_rect(0.12, 0.12, 0.58, 2.56)
    stroke_rect(2.90, 0.80, 0.58, 1.88)
    # Beds
    stroke_rect(10.40, 7.20, 2.00, 2.00)
    stroke_rect(12.25, 3.20, 1.80, 1.50)
    stroke_rect(12.25, 0.35, 1.80, 1.40)
    stroke_rect(7.45, 0.35, 1.60, 0.70)
    stroke_rect(11.40, 0.20, 0.40, 2.40)
    # Baths
    stroke_oval(7.45, 6.40, 1.70, 0.80)
    stroke_rect(7.40, 8.75, 1.00, 1.05)
    stroke_rect(7.40, 3.05, 0.90, 0.90)
    return "\n".join(parts)


def openings():
    marks = []

    def win(x, y, w, h):
        X, Y, W, H = box(x, y, w, h)
        marks.append(
            f'<rect x="{X}" y="{Y}" width="{W}" height="{H}" fill="#f4f8fc" stroke="#24557a" stroke-width="1.5"/>'
        )

    win(0.45, -0.12, 2.70, 0.12)
    win(3.75, -0.12, 1.50, 0.12)
    win(7.50, -0.12, 4.20, 0.12)
    win(12.20, -0.12, 2.60, 0.12)
    win(0.40, 9.96, 6.40, 0.16)
    win(10.00, 9.96, 4.60, 0.16)
    win(14.88, 3.10, 0.12, 2.40)
    win(14.88, 6.40, 0.12, 3.00)
    return "\n".join(marks)


def build(total):
    display = []
    for room in ROOMS:
        name, x, y, w, h, fill, en, slug = room
        if name == "主卫淋浴":
            continue
        if name == "主卫":
            w, h = 2.40, 4.20
        X, Y, W, H = box(x, y, w, h)
        display.append(
            f'<rect class="room" data-room="{slug}" x="{X}" y="{Y}" width="{W}" height="{H}" '
            f'fill="{fill}" stroke="#2a241c" stroke-width="2.2"/>'
        )

    # Dashed opening between dining and living
    x1, y1, w1, _h1 = box(0.15, 4.80, 5.10, 0)
    display.append(
        f'<line x1="{x1}" y1="{y1}" x2="{x1 + w1}" y2="{y1}" stroke="#2a241c" '
        f'stroke-width="1.4" stroke-dasharray="8 6"/>'
    )

    labels = []
    labeled = {
        "厨房": (1.80, 1.40),
        "生活阳台": (4.50, 1.40),
        "玄关": (6.30, 1.25),
        "书房": (9.60, 1.40),
        "次卧B": (13.50, 1.40),
        "餐厅": (2.70, 3.80),
        "走廊储物": (6.30, 5.40),
        "客卫": (8.40, 4.30),
        "衣帽间": (10.80, 4.30),
        "次卧A": (13.50, 4.30),
        "客厅": (2.70, 6.70),
        "主卫": (8.40, 7.90),
        "主卧": (12.30, 7.50),
        "南阳台": (3.60, 9.30),
    }
    areas = {r[0]: area(r) for r in ROOMS}
    areas["主卫"] = round(areas["主卫"] + areas.get("主卫淋浴", 0), 2)
    for name, x, y, w, h, fill, en, slug in ROOMS:
        if name == "主卫淋浴":
            continue
        cx, cy = labeled[name]
        X, Y = OX + px(cx), OY + px(cy)
        labels.append(text(X, Y - 4, name, 15, 700))
        labels.append(text(X, Y + 14, f"{areas[name]:.2f}㎡", 12, 500, "#5a5146"))
        labels.append(text(X, Y + 28, en, 10, 400, "#7a7166"))

    ox, oy, ow, oh = box(0, 0, PLAN_W, PLAN_H)
    nx, ny = ox + ow + 50, oy + 34

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 740" role="img"
      aria-labelledby="planTitle planDesc">
  <title id="planTitle">150㎡ 四室两厅两卫 平面布置图</title>
  <desc id="planDesc">南向住宅，面宽 15.00 米，进深 10.00 米，套内合计 {total:.0f} 平方米。客餐厅进深 5.80 米。</desc>
  <rect width="1000" height="740" fill="#fbf7ef"/>
  <g id="rooms">{''.join(display)}</g>
  <g id="furniture" opacity="0.88">{furniture()}</g>
  <g id="openings">{openings()}</g>
  <rect x="{ox}" y="{oy}" width="{ow}" height="{oh}" fill="none" stroke="#1b1610" stroke-width="5"/>
  <line x1="{OX + px(7.2)}" y1="{OY + px(8.6)}" x2="{OX + px(9.6)}" y2="{OY + px(8.6)}"
    stroke="#2a241c" stroke-width="2.2"/>
  <g id="labels">{''.join(labels)}</g>
  {dim_h(0, -0.58, 5.40, "5400")}
  {dim_h(5.40, -0.58, 1.80, "1800")}
  {dim_h(7.20, -0.58, 4.80, "4800")}
  {dim_h(12.00, -0.58, 3.00, "3000")}
  {dim_h(0, 10.58, 15.00, "15000")}
  {dim_v(-0.58, 0, 2.80, "2800")}
  {dim_v(-0.58, 2.80, 5.80, "5800")}
  {dim_v(-0.58, 8.60, 1.40, "1400")}
  {dim_v(15.58, 0, 10.00, "10000")}
  <g transform="translate({nx},{ny})">
    <polygon points="0,-22 8,10 -8,10" fill="#1b1610"/>
    <line x1="0" y1="10" x2="0" y2="28" stroke="#1b1610" stroke-width="2"/>
    {text(0, 46, "N", 14, 700)}
  </g>
  <g transform="translate({ox},{oy + oh + 54})">
    <line x1="0" y1="0" x2="{px(5)}" y2="0" stroke="#1b1610" stroke-width="2"/>
    <line x1="0" y1="-6" x2="0" y2="6" stroke="#1b1610"/>
    <line x1="{px(5)}" y1="-6" x2="{px(5)}" y2="6" stroke="#1b1610"/>
    {text(px(2.5), 20, "0 — 5 m", 12, 500)}
  </g>
  {text(OX + px(7.5), 34, "150㎡ 四室两厅两卫　平面布置图", 22, 700)}
  {text(OX + px(7.5), 56, f"南向 · 面宽 15.00m · 进深 10.00m · 套内 {total:.0f}㎡ · 客餐厅进深 5.80m · 比例 1:50", 13, 400, "#6b5a3e")}
</svg>
"""


if __name__ == "__main__":
    total = verify()
    out = Path(__file__).resolve().parents[1] / "assets" / "plans" / "floorplan.svg"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(build(total), encoding="utf-8")
    print(f"wrote {out} total={total}")
    for room in ROOMS:
        if room[0] == "主卫淋浴":
            continue
        a = round(area(room) + (3.36 if room[0] == "主卫" else 0), 2)
        print(f"  {room[0]:8s} {a:6.2f}  {room[6]}")
