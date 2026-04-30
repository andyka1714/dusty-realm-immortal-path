#!/usr/bin/env python3
import argparse
import json
import shutil
from collections import deque
from pathlib import Path

from PIL import Image

FRAME_SIZE = 96
ROWS = 4
COLS = 4
FRAME_COUNT = ROWS * COLS
TARGET_HEIGHT = 80
HEIGHT_TOLERANCE = 1
FOOTLINE_Y = 88
CENTER_X = 48
CENTER_TOLERANCE = 1
ROW_ORDER = ["down", "left", "right", "up"]


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True
    return r >= 150 and b >= 140 and g <= 115 and abs(r - b) <= 130


def is_saturated_chroma(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return False
    return r > 140 and b > 140 and g < 95 and abs(r - b) < 95


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    pix = image.load()
    points = [
        (x, y)
        for y in range(image.height)
        for x in range(image.width)
        if pix[x, y][3] > 0
    ]
    if not points:
        raise ValueError("empty frame")
    xs = [x for x, _ in points]
    ys = [y for _, y in points]
    return min(xs), min(ys), max(xs), max(ys)


def strip_background(cell: Image.Image) -> Image.Image:
    output = cell.convert("RGBA")
    pix = output.load()
    for y in range(output.height):
        for x in range(output.width):
            if is_background(pix[x, y]):
                pix[x, y] = (0, 0, 0, 0)
    return output


def clean_chroma(frame: Image.Image) -> Image.Image:
    output = frame.convert("RGBA")
    pix = output.load()
    for y in range(output.height):
        for x in range(output.width):
            if is_saturated_chroma(pix[x, y]):
                pix[x, y] = (0, 0, 0, 0)
    return output


def connected_component_sizes(frame: Image.Image) -> list[int]:
    pix = frame.load()
    points = {
        (x, y)
        for y in range(frame.height)
        for x in range(frame.width)
        if pix[x, y][3] > 0
    }
    seen: set[tuple[int, int]] = set()
    sizes: list[int] = []
    for point in points:
        if point in seen:
            continue
        queue = deque([point])
        seen.add(point)
        size = 0
        while queue:
            x, y = queue.popleft()
            size += 1
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if (
                    0 <= nx < frame.width
                    and 0 <= ny < frame.height
                    and (nx, ny) in points
                    and (nx, ny) not in seen
                ):
                    seen.add((nx, ny))
                    queue.append((nx, ny))
        sizes.append(size)
    return sorted(sizes, reverse=True)


def largest_component_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    pix = image.load()
    points = {
        (x, y)
        for y in range(image.height)
        for x in range(image.width)
        if pix[x, y][3] > 0
    }
    if not points:
        raise ValueError("empty frame")

    seen: set[tuple[int, int]] = set()
    best: list[tuple[int, int]] = []
    for point in points:
        if point in seen:
            continue
        queue = deque([point])
        seen.add(point)
        component: list[tuple[int, int]] = []
        while queue:
            x, y = queue.popleft()
            component.append((x, y))
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if (
                    0 <= nx < image.width
                    and 0 <= ny < image.height
                    and (nx, ny) in points
                    and (nx, ny) not in seen
                ):
                    seen.add((nx, ny))
                    queue.append((nx, ny))
        if len(component) > len(best):
            best = component

    xs = [x for x, _ in best]
    ys = [y for _, y in best]
    return min(xs), min(ys), max(xs), max(ys)


def normalize_cell(cell: Image.Image) -> Image.Image:
    foreground = strip_background(cell)
    left, top, right, bottom = largest_component_bbox(foreground)
    sprite = foreground.crop((left, top, right + 1, bottom + 1))
    scale = TARGET_HEIGHT / sprite.height
    target_width = round(sprite.width * scale)
    sprite = sprite.resize((target_width, TARGET_HEIGHT), Image.Resampling.NEAREST)
    sprite = clean_chroma(sprite)

    frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    x = round(CENTER_X - target_width / 2)
    y = FOOTLINE_Y - TARGET_HEIGHT + 1
    frame.alpha_composite(sprite, (x, y))
    return frame


def qc_frame(frame: Image.Image, label: str) -> dict:
    left, top, right, bottom = alpha_bbox(frame)
    width = right - left + 1
    height = bottom - top + 1
    center = (left + right) / 2
    edge = left <= 0 or top <= 0 or right >= FRAME_SIZE - 1 or bottom >= FRAME_SIZE - 1
    chroma_count = sum(
        1
        for y in range(FRAME_SIZE)
        for x in range(FRAME_SIZE)
        if is_saturated_chroma(frame.getpixel((x, y)))
    )
    large_components = [size for size in connected_component_sizes(frame) if size > 40]

    failures = []
    if not (TARGET_HEIGHT - HEIGHT_TOLERANCE <= height <= TARGET_HEIGHT + HEIGHT_TOLERANCE):
        failures.append(f"height {height}")
    if bottom != FOOTLINE_Y:
        failures.append(f"footline {bottom}")
    if abs(center - CENTER_X) > CENTER_TOLERANCE:
        failures.append(f"center {center}")
    if edge:
        failures.append("edge touch")
    if chroma_count:
        failures.append(f"chroma {chroma_count}")
    if len(large_components) != 1:
        failures.append(f"components {large_components}")

    return {
        "label": label,
        "bbox": [left, top, right, bottom],
        "width": width,
        "height": height,
        "centerX": center,
        "footlineY": bottom,
        "largeComponents": large_components,
        "chromaCount": chroma_count,
        "passed": not failures,
        "failures": failures,
    }


def write_sheet(frames: list[Image.Image], output_path: Path) -> None:
    sheet = Image.new("RGBA", (FRAME_SIZE * COLS, FRAME_SIZE * ROWS), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        row = index // COLS
        col = index % COLS
        sheet.paste(frame, (col * FRAME_SIZE, row * FRAME_SIZE))
    sheet.save(output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--prompt-file")
    parser.add_argument("--prompt", default="")
    parser.add_argument("--label-prefix", default="player_sheet")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    frames_dir = output_dir / "frames"
    output_dir.mkdir(parents=True, exist_ok=True)
    frames_dir.mkdir(parents=True, exist_ok=True)

    raw = Image.open(input_path).convert("RGBA")
    x_edges = [round(raw.width * index / COLS) for index in range(COLS + 1)]
    y_edges = [round(raw.height * index / ROWS) for index in range(ROWS + 1)]

    frames: list[Image.Image] = []
    qc_results: list[dict] = []
    for row in range(ROWS):
        for col in range(COLS):
            index = row * COLS + col + 1
            cell = raw.crop(
                (
                    x_edges[col],
                    y_edges[row],
                    x_edges[col + 1],
                    y_edges[row + 1],
                )
            )
            frame = normalize_cell(cell)
            label = f"{args.label_prefix}-{index}"
            qc = qc_frame(frame, label)
            frames.append(frame)
            qc_results.append(qc)

    failed = [qc for qc in qc_results if not qc["passed"]]
    if failed:
        print(json.dumps(failed, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    shutil.copyfile(input_path, output_dir / "raw-sheet.png")
    for index, frame in enumerate(frames, start=1):
        filename = f"{args.label_prefix}-{index}.png"
        frame.save(output_dir / filename)
        frame.save(frames_dir / filename)
    write_sheet(frames, output_dir / "sheet-transparent.png")
    frames[0].save(
        output_dir / "animation.gif",
        save_all=True,
        append_images=frames[1:],
        duration=160,
        loop=0,
        disposal=2,
    )

    prompt = args.prompt
    if args.prompt_file:
        prompt = Path(args.prompt_file).read_text()
        shutil.copyfile(args.prompt_file, output_dir / "prompt-used.txt")
    else:
        (output_dir / "prompt-used.txt").write_text(prompt)

    meta = {
        "target": "player",
        "mode": "humanoid_walk_sheet",
        "input": str(input_path),
        "prompt": prompt,
        "rows": ROWS,
        "cols": COLS,
        "frameCount": FRAME_COUNT,
        "frameWidth": FRAME_SIZE,
        "frameHeight": FRAME_SIZE,
        "profile": "humanoid",
        "rowOrder": ROW_ORDER,
        "targetHeight": TARGET_HEIGHT,
        "heightTolerance": HEIGHT_TOLERANCE,
        "footlineY": FOOTLINE_Y,
        "centerX": CENTER_X,
        "centerTolerance": CENTER_TOLERANCE,
        "qcStatus": "passed",
        "qc": qc_results,
    }
    (output_dir / "pipeline-meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n"
    )
    print(output_dir)


if __name__ == "__main__":
    main()
