#!/usr/bin/env python3
import argparse
import json
import shutil
from collections import deque
from pathlib import Path

from PIL import Image

FRAME_SIZE = 96
ROWS = 4
COLS = 6
FRAME_COUNT = ROWS * COLS
TARGET_HEIGHT = 80
MAX_WIDTH = 90
FOOTLINE_Y = 88
CENTER_X = 48
CENTER_TOLERANCE = 2
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


def alpha_points(image: Image.Image) -> set[tuple[int, int]]:
    pix = image.load()
    return {
        (x, y)
        for y in range(image.height)
        for x in range(image.width)
        if pix[x, y][3] > 0
    }


def component_points(image: Image.Image) -> list[tuple[int, int]]:
    points = alpha_points(image)
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

    return best


def bbox_from_points(points: list[tuple[int, int]]) -> tuple[int, int, int, int]:
    xs = [x for x, _ in points]
    ys = [y for _, y in points]
    return min(xs), min(ys), max(xs), max(ys)


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    points = list(alpha_points(image))
    if not points:
        raise ValueError("empty frame")
    return bbox_from_points(points)


def component_sizes(frame: Image.Image) -> list[int]:
    points = alpha_points(frame)
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


def normalize_cell(cell: Image.Image) -> Image.Image:
    foreground = strip_background(cell)
    left, top, right, bottom = bbox_from_points(component_points(foreground))
    sprite = foreground.crop((left, top, right + 1, bottom + 1))
    scale = min(TARGET_HEIGHT / sprite.height, MAX_WIDTH / sprite.width)
    target_width = max(1, round(sprite.width * scale))
    target_height = max(1, round(sprite.height * scale))
    sprite = sprite.resize((target_width, target_height), Image.Resampling.NEAREST)
    sprite = clean_chroma(sprite)

    frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    x = round(CENTER_X - target_width / 2)
    y = FOOTLINE_Y - target_height + 1
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
    large_components = [size for size in component_sizes(frame) if size > 40]

    failures = []
    if height > TARGET_HEIGHT:
        failures.append(f"height {height}")
    if bottom != FOOTLINE_Y:
        failures.append(f"footline {bottom}")
    if abs(center - CENTER_X) > CENTER_TOLERANCE:
        failures.append(f"center {center}")
    if edge:
        failures.append("edge touch")
    if chroma_count:
        failures.append(f"chroma {chroma_count}")
    if not large_components:
        failures.append("missing component")

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


def write_direction_gifs(frames: list[Image.Image], output_dir: Path) -> None:
    for row, direction in enumerate(ROW_ORDER):
        row_frames = frames[row * COLS : (row + 1) * COLS]
        row_frames[0].save(
            output_dir / f"combat-{direction}.gif",
            save_all=True,
            append_images=row_frames[1:],
            duration=120,
            loop=0,
            disposal=2,
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--prompt-file")
    parser.add_argument("--prompt", default="")
    parser.add_argument("--label-prefix", default="combat_sheet")
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
            cell = raw.crop((x_edges[col], y_edges[row], x_edges[col + 1], y_edges[row + 1]))
            frame = normalize_cell(cell)
            label = f"{args.label_prefix}-{index}"
            frames.append(frame)
            qc_results.append(qc_frame(frame, label))

    failed = [qc for qc in qc_results if not qc["passed"]]
    if failed:
        print(json.dumps(failed, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    shutil.copyfile(input_path, output_dir / "raw-combat.png")
    shutil.copyfile(input_path, output_dir / "raw-sheet.png")
    for index, frame in enumerate(frames, start=1):
        filename = f"{args.label_prefix}-{index}.png"
        frame.save(output_dir / filename)
        frame.save(frames_dir / filename)
    write_sheet(frames, output_dir / "sheet-transparent.png")
    write_direction_gifs(frames, output_dir)
    frames[0].save(
        output_dir / "animation.gif",
        save_all=True,
        append_images=frames[1:],
        duration=120,
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
        "mode": "humanoid_combat_sheet",
        "input": str(input_path),
        "prompt": prompt,
        "rows": ROWS,
        "cols": COLS,
        "frameCount": FRAME_COUNT,
        "framesPerDirection": COLS,
        "frameWidth": FRAME_SIZE,
        "frameHeight": FRAME_SIZE,
        "profile": "humanoid",
        "rowOrder": ROW_ORDER,
        "targetHeight": TARGET_HEIGHT,
        "maxWidth": MAX_WIDTH,
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
