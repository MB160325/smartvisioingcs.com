#!/usr/bin/env python3
"""تصغير صور الموقع لتخفيف الثقل. لا يعدّل الأصل: ينشئ نسخة محسّنة بنفس الأسماء والمسارات.
الاستخدام:   pip install pillow
             python optimize_images.py  "مسار-مجلد-الموقع"
ثم استبدل الصور على الاستضافة بالنسخة الموجودة في مجلد  <المجلد>_optimized
"""
import os, sys
from PIL import Image
MAX = 2000                      # أقصى بُعد بالبكسل (كافٍ للشاشات الكبيرة)
src = sys.argv[1].rstrip('/\\'); dst = src + '_optimized'; tot_b = tot_a = 0
for dp, _, files in os.walk(src):
    for f in files:
        if not f.lower().endswith(('.png', '.jpg', '.jpeg')): continue
        p = os.path.join(dp, f); o = os.path.join(dst, os.path.relpath(p, src)); os.makedirs(os.path.dirname(o), exist_ok=True)
        b = os.path.getsize(p)
        try:
            im = Image.open(p); im.thumbnail((MAX, MAX), Image.LANCZOS)
            if f.lower().endswith('.png'):
                alpha = im.mode in ('RGBA', 'LA') or 'transparency' in im.info
                if not alpha and b > 1_500_000: im = im.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=256)  # رسومات هندسية
                im.save(o, optimize=True)
            else:
                im.convert('RGB').save(o, quality=82, optimize=True, progressive=True)
            a = os.path.getsize(o)
            if a >= b:  # لو لم يصغر الملف نحتفظ بالأصل
                with open(p, 'rb') as r, open(o, 'wb') as w: w.write(r.read())
                a = b
        except Exception as e:
            print('تخطي', p, e); continue
        tot_b += b; tot_a += a
print('قبل: %.1f MB  بعد: %.1f MB' % (tot_b / 1e6, tot_a / 1e6))
