#!/usr/bin/env python3
import argparse
from pathlib import Path

from PIL import Image


QUADRANTS = {
    "tl": (0, 0),
    "tr": (1, 0),
    "bl": (0, 1),
    "br": (1, 1),
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--quadrant", choices=QUADRANTS.keys(), required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    col, row = QUADRANTS[args.quadrant]
    half_width = image.width // 2
    half_height = image.height // 2
    crop = image.crop(
        (
            col * half_width,
            row * half_height,
            (col + 1) * half_width,
            (row + 1) * half_height,
        )
    )

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    crop.save(output)


if __name__ == "__main__":
    main()
