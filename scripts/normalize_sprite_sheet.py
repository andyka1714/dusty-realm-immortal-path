#!/usr/bin/env python3
"""Normalize transparent sprite sheet frame height and footline."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


def normalize_sheet(
    directory: Path,
    rows: int,
    cols: int,
    label_prefix: str,
    target_height: int,
    foot_y: int,
) -> None:
    sheet_path = directory / "sheet-transparent.png"
    meta_path = directory / "pipeline-meta.json"
    sheet = Image.open(sheet_path).convert("RGBA")
    cell_width = sheet.width // cols
    cell_height = sheet.height // rows
    normalized = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    frames_dir = directory / "frames"
    frames_dir.mkdir(exist_ok=True)

    for frame_path in directory.glob(f"{label_prefix}-*.png"):
        frame_path.unlink()
    for frame_path in frames_dir.glob(f"{label_prefix}-*.png"):
        frame_path.unlink()

    frames: list[dict[str, object]] = []
    gif_frames: list[Image.Image] = []
    for row in range(rows):
        for col in range(cols):
            frame = sheet.crop(
                (
                    col * cell_width,
                    row * cell_height,
                    (col + 1) * cell_width,
                    (row + 1) * cell_height,
                )
            )
            bbox = frame.getchannel("A").getbbox()
            if bbox is None:
                crop = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
            else:
                crop = frame.crop(bbox)

            scale = target_height / crop.height
            width = max(1, round(crop.width * scale))
            crop = crop.resize((width, target_height), Image.Resampling.LANCZOS)
            x = (cell_width - crop.width) // 2
            y = foot_y - crop.height

            canvas = Image.new("RGBA", (cell_width, cell_height), (0, 0, 0, 0))
            canvas.paste(crop, (x, y), crop)
            normalized.paste(canvas, (col * cell_width, row * cell_height), canvas)

            index = row * cols + col + 1
            frame_name = f"{label_prefix}-{index}.png"
            canvas.save(directory / frame_name)
            canvas.save(frames_dir / frame_name)
            gif_frames.append(canvas)
            frames.append(
                {
                    "grid": [row, col],
                    "output_size": [crop.width, crop.height],
                    "paste_position": [x, y],
                    "edge_touch": False,
                }
            )

    normalized.save(sheet_path)
    normalized.save(directory / "raw-sheet-clean.png")
    if gif_frames:
      gif_frames[0].save(
          directory / "animation.gif",
          save_all=True,
          append_images=gif_frames[1:],
          duration=160,
          loop=0,
          disposal=2,
      )

    metadata = {}
    if meta_path.exists():
        metadata = json.loads(meta_path.read_text())
    metadata.update(
        {
            "rows": rows,
            "cols": cols,
            "cell_size": cell_width,
            "frames": frames,
            "edge_touch_frames": [],
            "scale_normalization": {
                "target_output_height": target_height,
                "foot_y": foot_y,
                "reason": "player 1x2 sprite baseline normalization",
            },
        }
    )
    meta_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    parser.add_argument("--rows", type=int, required=True)
    parser.add_argument("--cols", type=int, required=True)
    parser.add_argument("--label-prefix", required=True)
    parser.add_argument("--target-height", type=int, default=80)
    parser.add_argument("--foot-y", type=int, default=89)
    args = parser.parse_args()

    normalize_sheet(
        args.directory,
        rows=args.rows,
        cols=args.cols,
        label_prefix=args.label_prefix,
        target_height=args.target_height,
        foot_y=args.foot_y,
    )


if __name__ == "__main__":
    main()
