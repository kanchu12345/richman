from PIL import Image, ImageDraw
import sys

try:
    # Open image and convert to RGBA
    img = Image.open('image/logo.jpg.jpeg').convert('RGBA')
    width, height = img.size
    
    # Find bounding box if the circle doesn't touch the edges completely
    # But usually a circular crop is enough for logos.
    # We will draw a circle touching the edges
    # Let's crop to square first just in case
    min_dim = min(width, height)
    left = (width - min_dim)/2
    top = (height - min_dim)/2
    right = (width + min_dim)/2
    bottom = (height + min_dim)/2
    img = img.crop((left, top, right, bottom))
    width, height = img.size
    
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, width, height), fill=255)
    
    # Apply mask
    img_transparent = Image.new('RGBA', (width, height), (0,0,0,0))
    img_transparent.paste(img, (0,0), mask=mask)
    
    # Let's save a full size transparent logo
    img_transparent.save('image/logo.png')
    
    # Resize for favicon
    # 256x256 is a standard good size for favicon
    img_favicon = img_transparent.resize((256, 256), Image.Resampling.LANCZOS)
    img_favicon.save('image/favicon.png')
    print("Success")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
