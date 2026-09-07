import sys
from PIL import Image

def main():
    if len(sys.argv) != 3:
        print("Usage: python png_to_bmp.py <input.png> <output.bmp>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    img = Image.open(input_path)

    if "A" in img.getbands():
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.getchannel("A"))
        img = background
    else:
        img = img.convert("RGB")

    img.save(output_path, format="BMP")
    print(f"Saved {output_path}")

if __name__ == "__main__":
    main()
