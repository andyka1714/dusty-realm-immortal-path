#!/usr/bin/env python3
"""Measure monster sprite sheets against the player 1x2 pixel baseline."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from statistics import mean
from typing import Any

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PLAYER_MOVEMENT = ROOT / "public/assets/generated/characters/player/mortal-male-v1/sheet-transparent.png"
PLAYER_COMBAT = ROOT / "public/assets/generated/characters/player/mortal-male-combat-v1/sheet-transparent.png"
MONSTER_ROOT = ROOT / "public/assets/generated/characters/monsters"


def measure_sheet(path: Path, rows: int, cols: int) -> dict[str, Any]:
    image = Image.open(path).convert("RGBA")
    cell_width = image.width // cols
    cell_height = image.height // rows
    frames: list[dict[str, Any]] = []

    for row in range(rows):
        for col in range(cols):
            frame = image.crop(
                (
                    col * cell_width,
                    row * cell_height,
                    (col + 1) * cell_width,
                    (row + 1) * cell_height,
                )
            )
            bbox = frame.getchannel("A").getbbox()
            if bbox is None:
                continue

            x0, y0, x1, y1 = bbox
            frames.append(
                {
                    "row": row,
                    "col": col,
                    "width": x1 - x0,
                    "height": y1 - y0,
                    "footY": y1,
                    "bbox": [x0, y0, x1, y1],
                }
            )

    widths = [frame["width"] for frame in frames]
    heights = [frame["height"] for frame in frames]
    foot_y = [frame["footY"] for frame in frames]

    return {
        "path": str(path.relative_to(ROOT)),
        "sheetSize": [image.width, image.height],
        "cellSize": [cell_width, cell_height],
        "frameCount": len(frames),
        "avgWidth": round(mean(widths), 2),
        "minWidth": min(widths),
        "maxWidth": max(widths),
        "avgHeight": round(mean(heights), 2),
        "minHeight": min(heights),
        "maxHeight": max(heights),
        "avgFootY": round(mean(foot_y), 2),
        "minFootY": min(foot_y),
        "maxFootY": max(foot_y),
        "frames": frames,
    }


def evaluate_pair(enemy_id: str, movement: dict[str, Any], combat: dict[str, Any], baseline: dict[str, Any]) -> dict[str, Any]:
    is_humanoid_baseline = enemy_id in {"m1_c2", "m2_c1"}
    max_height_delta = 0.04 if is_humanoid_baseline else 0.12
    baseline_height = baseline["avgHeight"]
    baseline_foot_y = baseline["avgFootY"]
    tile_px = baseline_height / 2
    height_ratio = combat["avgHeight"] / movement["avgHeight"]
    foot_delta = abs(combat["avgFootY"] - movement["avgFootY"])
    movement_player_delta = abs(movement["avgHeight"] - baseline_height)
    combat_player_delta = abs(combat["avgHeight"] - baseline_height)

    def edge_margin_issues(label: str, sheet: dict[str, Any], min_margin: int = 2) -> list[str]:
        cell_width, cell_height = sheet["cellSize"]
        bad_frames = []
        for frame in sheet["frames"]:
            x0, y0, x1, y1 = frame["bbox"]
            if (
                x0 < min_margin
                or y0 < min_margin
                or cell_width - x1 < min_margin
                or cell_height - y1 < min_margin
            ):
                bad_frames.append([frame["row"], frame["col"]])
        if bad_frames:
            return [f"{label} frames too close to cell edge: {bad_frames}"]
        return []

    issues: list[str] = []
    if abs(height_ratio - 1) > max_height_delta:
        issues.append(f"movement/combat height mismatch > {round(max_height_delta * 100)}%")
    if foot_delta > 1:
        issues.append("movement/combat footline mismatch > 1px")
    if is_humanoid_baseline and movement_player_delta > 3:
        issues.append("movement height drifts from 1x2 humanoid player baseline > 3px")
    if is_humanoid_baseline and combat_player_delta > 3:
        issues.append("combat height drifts from 1x2 humanoid player baseline > 3px")
    if is_humanoid_baseline and movement["maxHeight"] - movement["minHeight"] > 2:
        issues.append("movement frame height variance > 2px")
    if is_humanoid_baseline and combat["maxHeight"] - combat["minHeight"] > 4:
        issues.append("combat frame height variance > 4px")
    issues.extend(edge_margin_issues("movement", movement))
    issues.extend(edge_margin_issues("combat", combat))

    return {
        "enemyId": enemy_id,
        "playerBaseline": {
            "tilePx": round(tile_px, 2),
            "oneByTwoHeightPx": baseline_height,
            "footY": baseline_foot_y,
        },
        "movement": {k: movement[k] for k in ["avgWidth", "avgHeight", "minHeight", "maxHeight", "avgFootY", "minFootY", "maxFootY"]},
        "combat": {k: combat[k] for k in ["avgWidth", "avgHeight", "minHeight", "maxHeight", "avgFootY", "minFootY", "maxFootY"]},
        "heightRatio": round(height_ratio, 4),
        "footlineDelta": round(foot_delta, 2),
        "passed": len(issues) == 0,
        "issues": issues,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--enemy", action="append", default=[])
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    baseline = measure_sheet(PLAYER_MOVEMENT, 4, 4)
    combat_baseline = measure_sheet(PLAYER_COMBAT, 4, 6)
    enemy_ids = args.enemy or sorted(
        {
            path.name.removesuffix("-movement-v1")
            for path in MONSTER_ROOT.glob("*-movement-v1")
            if (path / "sheet-transparent.png").exists()
        }
    )

    results: list[dict[str, Any]] = []
    for enemy_id in enemy_ids:
        movement_path = MONSTER_ROOT / f"{enemy_id.replace('_', '-')}-movement-v1/sheet-transparent.png"
        combat_path = MONSTER_ROOT / f"{enemy_id.replace('_', '-')}-combat-v1/sheet-transparent.png"
        if not movement_path.exists() or not combat_path.exists():
            results.append({"enemyId": enemy_id, "passed": False, "issues": ["missing movement or combat sheet"]})
            continue

        movement = measure_sheet(movement_path, 4, 4)
        combat = measure_sheet(combat_path, 4, 6)
        results.append(evaluate_pair(enemy_id, movement, combat, baseline))

    output = {
        "playerMovementBaseline": {
            "avgWidth": baseline["avgWidth"],
            "avgHeight": baseline["avgHeight"],
            "footY": baseline["avgFootY"],
            "tilePx": round(baseline["avgHeight"] / 2, 2),
        },
        "playerCombatBaseline": {
            "avgWidth": combat_baseline["avgWidth"],
            "avgHeight": combat_baseline["avgHeight"],
            "footY": combat_baseline["avgFootY"],
        },
        "results": results,
    }

    if args.json:
        print(json.dumps(output, ensure_ascii=False, indent=2))
        return

    print(f"Player 1x2 baseline: height={baseline['avgHeight']}px, tile={baseline['avgHeight'] / 2:.2f}px, footY={baseline['avgFootY']}")
    for result in results:
        status = "PASS" if result["passed"] else "FAIL"
        print(f"{status} {result['enemyId']}")
        for issue in result.get("issues", []):
            print(f"  - {issue}")


if __name__ == "__main__":
    main()
