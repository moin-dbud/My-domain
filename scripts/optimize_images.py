import os
import glob
from PIL import Image

PUBLIC_DIR = r"d:\My Domain\site\public"

def optimize_image(filename, target_name, max_size, quality=82):
    src_path = os.path.join(PUBLIC_DIR, filename)
    dst_path = os.path.join(PUBLIC_DIR, target_name)
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        return
    
    initial_size = os.path.getsize(src_path)
    with Image.open(src_path) as img:
        img = img.convert("RGB")
        # Maintain aspect ratio while resizing within max_size bounds
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(dst_path, "WEBP", quality=quality, method=6)
        
    final_size = os.path.getsize(dst_path)
    print(f"Optimized {filename} -> {target_name}: {initial_size/1024:.1f} KB -> {final_size/1024:.1f} KB")

# Photo Arc Wheel images (Target 300x450 max for 2x Retina on 140x210 cards)
for i in range(1, 11):
    ext = ".png" if i in (4, 9) else ".webp"
    src = f"image{i}{ext}"
    dst = f"image{i}.webp"
    optimize_image(src, dst, (300, 450), quality=82)

# Project previews
optimize_image("buildo-laptop.png", "buildo-laptop.webp", (800, 500), quality=82)
optimize_image("mobile-buildo.png", "mobile-buildo.webp", (400, 800), quality=82)
optimize_image("volunteeriq-desktop.png", "volunteeriq-desktop.webp", (800, 500), quality=82)
optimize_image("volunteeriq-mobile.png", "volunteeriq-mobile.webp", (400, 800), quality=82)
optimize_image("profile.jpeg", "profile.webp", (400, 400), quality=82)

# Other desktop/mobile previews
optimize_image("desktop-madeit.webp", "desktop-madeit.webp", (800, 500), quality=82)
optimize_image("mobile-madeit.webp", "mobile-madeit.webp", (400, 800), quality=82)
optimize_image("desktop-nexora.webp", "desktop-nexora.webp", (800, 500), quality=82)
optimize_image("mobile-nexora.webp", "mobile-nexora.webp", (400, 800), quality=82)
optimize_image("desktop-levelup.webp", "desktop-levelup.webp", (800, 500), quality=82)
optimize_image("mobile-levelup.webp", "mobile-levelup.webp", (400, 800), quality=82)
optimize_image("desktop-resume.webp", "desktop-resume.webp", (800, 500), quality=82)
optimize_image("mobile-resume.webp", "mobile-resume.webp", (400, 800), quality=82)
