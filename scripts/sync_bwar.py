"""Syncs Baseball-Reference season WAR (bWAR) into Supabase.

Run by .github/workflows/sync-bwar.yml on a schedule. Pulls the full batting
and pitching WAR history via pybaseball (which itself just downloads
Baseball-Reference's public war_daily_bat.txt / war_daily_pitch.txt files),
upserts every row into bwar_seasons, then refreshes the `bwar` column on
already-published inductees so their career totals stay current as they keep
playing.

Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
"""

import os
import sys

import pandas as pd
import requests
from pybaseball import bwar_bat, bwar_pitch

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

CHUNK_SIZE = 1000


def build_rows(df: pd.DataFrame, player_type: str) -> list[dict]:
    rows = []
    for _, r in df.iterrows():
        mlb_id = r.get("mlb_ID")
        if pd.isna(mlb_id):
            continue
        stint = r.get("stint_ID", 1)
        rows.append(
            {
                "mlb_id": int(mlb_id),
                "year_id": int(r["year_ID"]),
                "player_type": player_type,
                "team_id": None if pd.isna(r.get("team_ID")) else str(r.get("team_ID")),
                "stint_id": 1 if pd.isna(stint) else int(stint),
                "war": None if pd.isna(r.get("WAR")) else float(r["WAR"]),
                "war_rep": None if pd.isna(r.get("WAR_rep")) else float(r["WAR_rep"]),
                "waa": None if pd.isna(r.get("WAA")) else float(r["WAA"]),
            }
        )
    return rows


def upsert(table: str, rows: list[dict], on_conflict: str) -> None:
    if not rows:
        return
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={on_conflict}"
    headers = {**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"}
    for i in range(0, len(rows), CHUNK_SIZE):
        chunk = rows[i : i + CHUNK_SIZE]
        resp = requests.post(url, headers=headers, json=chunk, timeout=60)
        resp.raise_for_status()


def fetch_inductee_ids() -> set[int]:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/inductees?select=mlb_id",
        headers=HEADERS,
        timeout=60,
    )
    resp.raise_for_status()
    return {row["mlb_id"] for row in resp.json()}


def main() -> None:
    print("Fetching batting WAR from Baseball-Reference...")
    bat_rows = build_rows(bwar_bat(return_all=False), "bat")
    print(f"  {len(bat_rows)} batting rows")

    print("Fetching pitching WAR from Baseball-Reference...")
    pitch_rows = build_rows(bwar_pitch(return_all=False), "pitch")
    print(f"  {len(pitch_rows)} pitching rows")

    all_rows = bat_rows + pitch_rows
    if not all_rows:
        print("No rows fetched from Baseball-Reference; aborting without writing anything.")
        sys.exit(1)

    print(f"Upserting {len(all_rows)} rows into bwar_seasons...")
    upsert("bwar_seasons", all_rows, on_conflict="mlb_id,year_id,player_type,stint_id")

    career: dict[int, float] = {}
    for row in all_rows:
        if row["war"] is None:
            continue
        career[row["mlb_id"]] = career.get(row["mlb_id"], 0.0) + row["war"]

    inductee_ids = fetch_inductee_ids()
    refresh_rows = [
        {"mlb_id": mlb_id, "bwar": career[mlb_id]}
        for mlb_id in inductee_ids
        if mlb_id in career
    ]
    print(f"Refreshing career bWAR for {len(refresh_rows)} of {len(inductee_ids)} inductees...")
    upsert("inductees", refresh_rows, on_conflict="mlb_id")

    print("Done.")


if __name__ == "__main__":
    main()
