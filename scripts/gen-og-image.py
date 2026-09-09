# 生成 OG 分享预览图（1200×630，2x → 2400×1260 视网膜清晰）
# Pillow 直接绘制，中文走本机 simhei.ttf，保证不乱码
# 品牌：纸面底 #f7f4ee + 金放大镜 #d99a1e + 深金 #7a5213（与 favicon / ShareCard 一致）
import os
from PIL import Image, ImageDraw, ImageFont

S = 2  # 2x retina
W, H = 1200 * S, 630 * S
FONT = "C:/Windows/Fonts/simhei.ttf"

paper = (247, 244, 238)
ink = (42, 36, 28)
muted = (107, 99, 87)
gold = (217, 154, 30)
darkgold = (122, 82, 19)
goldlight = (240, 180, 41)
darkcard = (36, 31, 23)
mgray = (169, 156, 132)


def f(sz):
    return ImageFont.truetype(FONT, int(sz * S))


def round_rect(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle([(box[0] * S, box[1] * S), (box[2] * S, box[3] * S)],
                        radius=int(r * S), fill=fill, outline=outline, width=int(width * S))


def text(d, xy, s, size, fill, anchor="la", spacing=0):
    # anchor 'la' = left-ascent baseline-ish
    d.text((xy[0] * S, xy[1] * S), s, font=f(size), fill=fill, anchor=anchor, spacing=spacing * S)


img = Image.new("RGB", (W, H), paper)
ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))  # 半透明叠加层
d = ImageDraw.Draw(img)
od = ImageDraw.Draw(ov)

# 底部暗金细带（半透明）
od.rectangle([0, (H - 42 * S), W, H], fill=(122, 82, 19, 16))

# 顶部品牌行：手绘小放大镜 + 文字（避开 emoji 字体缺失）
d.ellipse([(60 * S, 52 * S), (84 * S, 76 * S)], outline=gold, width=int(4 * S))
d.line([(76 * S, 68 * S), (94 * S, 86 * S)], fill=darkgold, width=int(5 * S))
text(d, (108, 60), "学会提问", 26, darkgold)
text(d, (1120, 60), "ASKING THE RIGHT QUESTIONS", 17, mgray, anchor="ra")
# 分割线（金，半透明）
od.line([(80 * S, 98 * S), (1120 * S, 98 * S)], fill=(217, 154, 30, 115), width=int(2 * S))

# 主标题
text(d, (76, 175), "学会提问", 128, ink)
# 金色刷子下划线
od.line([(82 * S, 282 * S), (560 * S, 272 * S)], fill=gold, width=int(11 * S))
text(d, (80, 302), "ASKING THE RIGHT QUESTIONS", 22, darkgold)
# 副标题
text(d, (80, 360), "把《学会提问》13 章方法论，变成 5 套思维引擎", 27, ink)
text(d, (80, 398), "13 章 · 35 关 · 纯前端可玩 · 中英双语", 22, muted)

# 5 引擎胶囊
engines = [("论证透视镜", 80, 150), ("逻辑法庭", 244, 120), ("天平校准", 378, 120),
           ("数据拆弹", 512, 120), ("冲动驯兽场", 646, 128)]
for label, x, w in engines:
    round_rect(d, (x, 470, x + w, 514), 22, fill=(255, 253, 248), outline=gold, width=1.5)
    cx = x + w / 2
    text(d, (cx, 492), label, 19, ink, anchor="mm")

# 标语胶囊（深色卡）
round_rect(d, (80, 536, 442, 576), 20, fill=darkcard)
text(d, (261, 556), "“别急着相信，先学会提问”", 19, goldlight, anchor="mm")

# 右侧 emblem：放大镜 + 同心扫描环 + 四角星
ex, ey = 950, 300
for r, a in [(150, 90), (110, 115), (70, 150)]:
    od.ellipse([(ex - r) * S, (ey - r) * S, (ex + r) * S, (ey + r) * S],
               outline=(217, 154, 30, a), width=int(2 * S))
for dx, dy in [(150, 0), (0, 150), (-150, 0), (0, -150)]:
    od.line([ex * S, ey * S, (ex + dx) * S, (ey + dy) * S], fill=(217, 154, 30, 75), width=int(2 * S))
# 放大镜
lx, ly, lr = ex - 6, ey - 10, 62
od.ellipse([(lx - lr) * S, (ly - lr) * S, (lx + lr) * S, (ly + lr) * S],
           fill=(217, 154, 30, 26), outline=gold, width=int(13 * S))
od.line([(lx + 44) * S, (ly + 44) * S, (lx + 92) * S, (ly + 92) * S],
        fill=darkgold, width=int(18 * S))
# 四角星
star = [(ex + 40, ey - 82), (ex + 48, ey - 64), (ex + 66, ey - 56),
        (ex + 48, ey - 48), (ex + 40, ey - 30), (ex + 32, ey - 48),
        (ex + 14, ey - 56), (ex + 32, ey - 64)]
od.polygon([(px * S, py * S) for px, py in star], fill=darkgold)

img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, "public", "og-image.png")
os.makedirs(os.path.dirname(out), exist_ok=True)
img.save(out, "PNG")
print("written", out, os.path.getsize(out), "bytes", img.size)
