"""
NSE F&O Bhavcopy Downloader & Options Tracker (v2)
====================================================
Downloads daily F&O bhavcopy (end-of-day options data) from NSE India
and tracks call/put option activity across ALL available F&O stocks.

Data includes: Open Interest, Volume, Close Price, Strike Price, Expiry, etc.

Usage:
    python nse_options_tracker.py                    # Download today's data
    python nse_options_tracker.py --date 2025-02-10  # Download specific date
    python nse_options_tracker.py --range 2025-02-01 2025-02-10  # Date range
    python nse_options_tracker.py --symbol RELIANCE   # Filter by stock
"""

import os
import io
import sys
import zipfile
import argparse
import time
from datetime import datetime, timedelta
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("pandas not found. Install it: pip install pandas")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("requests not found. Install it: pip install requests")
    sys.exit(1)


# ─── Configuration ───────────────────────────────────────────────────────────

OUTPUT_DIR = Path("nse_fo_data")
OUTPUT_DIR.mkdir(exist_ok=True)

# NSE UDiFF F&O Bhavcopy URL (new format since July 2024)
BHAVCOPY_URL = (
    "https://nsearchives.nseindia.com/content/fo/"
    "BhavCopy_NSE_FO_0_0_0_{date}_F_0000.csv.zip"
)

# Fallback: old-style bhavcopy URL (pre-July 2024, for historical data)
BHAVCOPY_URL_OLD = (
    "https://nsearchives.nseindia.com/content/historical/DERIVATIVES/"
    "{year}/{month}/fo{ddmmmyyyy}bhav.csv.zip"
)

# Headers to mimic a browser (NSE blocks plain requests)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.nseindia.com/",
}


# ─── Core Functions ──────────────────────────────────────────────────────────


def get_nse_session():
    session = requests.Session()
    session.headers.update(HEADERS)
    try:
        session.get("https://www.nseindia.com/", timeout=10)
        time.sleep(1)
    except Exception as e:
        print(f"Warning: Could not establish NSE session: {e}")
    return session


def download_bhavcopy(date_obj, session=None):
    if session is None:
        session = get_nse_session()

    date_str = date_obj.strftime("%Y%m%d")
    url = BHAVCOPY_URL.format(date=date_str)

    print(f"Downloading F&O bhavcopy for {date_obj.strftime('%Y-%m-%d')}...")

    try:
        response = session.get(url, timeout=30)

        if response.status_code == 200:
            with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                csv_filename = z.namelist()[0]
                with z.open(csv_filename) as f:
                    df = pd.read_csv(f)
            print(f"   Success! {len(df)} records downloaded.")
            return df
        elif response.status_code == 404:
            print(f"   404 - No data for this date (holiday/weekend?).")
            if date_obj < datetime(2024, 7, 8):
                return _try_old_format(date_obj, session)
            return None
        else:
            print(f"   HTTP {response.status_code}")
            return None

    except Exception as e:
        print(f"   Error: {e}")
        return None


def _try_old_format(date_obj, session):
    url = BHAVCOPY_URL_OLD.format(
        year=date_obj.strftime("%Y"),
        month=date_obj.strftime("%b").upper(),
        ddmmmyyyy=date_obj.strftime("%d%b%Y").upper(),
    )
    try:
        response = session.get(url, timeout=30)
        if response.status_code == 200:
            with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                csv_filename = z.namelist()[0]
                with z.open(csv_filename) as f:
                    df = pd.read_csv(f)
            print(f"   Success (old format)! {len(df)} records.")
            return df
    except Exception:
        pass
    return None


def filter_options(df):
    """
    Filter to only include options (CE and PE).
    
    UDiFF format: FinInstrmTp = 'STO' (Stock Option) or 'IDO' (Index Option)
    Old format:   INSTRUMENT = 'OPTSTK' or 'OPTIDX'
    """
    df.columns = df.columns.str.strip()

    # UDiFF format (post July 2024)
    if "FinInstrmTp" in df.columns:
        options_mask = df["FinInstrmTp"].isin(["STO", "IDO"])
        options_df = df[options_mask].copy()
        print(f"   Filtered: {len(options_df)} option contracts (from {len(df)} total)")
        return options_df

    # Old format (pre July 2024)
    if "INSTRUMENT" in df.columns:
        options_mask = df["INSTRUMENT"].isin(["OPTSTK", "OPTIDX"])
        options_df = df[options_mask].copy()
        print(f"   Filtered: {len(options_df)} option contracts (from {len(df)} total)")
        return options_df

    # Fallback
    for col in df.columns:
        if df[col].dtype == object:
            vals = df[col].str.strip().unique()
            if "CE" in vals and "PE" in vals:
                options_df = df[df[col].isin(["CE", "PE"])].copy()
                print(f"   Filtered via {col}: {len(options_df)} option contracts")
                return options_df

    print(f"   Could not detect option type column. Returning all {len(df)} records.")
    return df


def summarize_options(df):
    """Create a summary of call/put activity by stock symbol."""
    df.columns = df.columns.str.strip()

    sym_col = _find_col(df, ["TckrSymb", "SYMBOL"])
    type_col = _find_col(df, ["OptnTp", "OPTION_TYP", "OPTION_TYPE"])
    oi_col = _find_col(df, ["OpnIntrst", "OPEN_INT", "OI"])
    chg_oi_col = _find_col(df, ["ChngInOpnIntrst", "CHG_IN_OI"])
    vol_col = _find_col(df, ["TtlTradgVol", "CONTRACTS", "VOLUME", "NO_OF_CONT"])
    val_col = _find_col(df, ["TtlTrfVal", "VAL_INLAKH", "TURNOVER"])

    if not sym_col or not type_col:
        print(f"   Could not detect required columns. Available: {list(df.columns)}")
        return df

    calls = df[df[type_col].str.strip().str.upper() == "CE"]
    puts = df[df[type_col].str.strip().str.upper() == "PE"]

    summary_data = []
    all_symbols = sorted(df[sym_col].unique())

    for symbol in all_symbols:
        sym_calls = calls[calls[sym_col] == symbol]
        sym_puts = puts[puts[sym_col] == symbol]

        row = {"Symbol": symbol}

        row["CE_Contracts"] = len(sym_calls)
        if vol_col:
            row["CE_Volume"] = int(pd.to_numeric(sym_calls[vol_col], errors="coerce").sum())
        if oi_col:
            row["CE_OI"] = int(pd.to_numeric(sym_calls[oi_col], errors="coerce").sum())
        if chg_oi_col:
            row["CE_OI_Change"] = int(pd.to_numeric(sym_calls[chg_oi_col], errors="coerce").sum())
        if val_col:
            row["CE_Turnover"] = pd.to_numeric(sym_calls[val_col], errors="coerce").sum()

        row["PE_Contracts"] = len(sym_puts)
        if vol_col:
            row["PE_Volume"] = int(pd.to_numeric(sym_puts[vol_col], errors="coerce").sum())
        if oi_col:
            row["PE_OI"] = int(pd.to_numeric(sym_puts[oi_col], errors="coerce").sum())
        if chg_oi_col:
            row["PE_OI_Change"] = int(pd.to_numeric(sym_puts[chg_oi_col], errors="coerce").sum())
        if val_col:
            row["PE_Turnover"] = pd.to_numeric(sym_puts[val_col], errors="coerce").sum()

        if oi_col and row.get("CE_OI", 0) > 0:
            row["PCR_OI"] = round(row["PE_OI"] / row["CE_OI"], 3)
        else:
            row["PCR_OI"] = None
        if vol_col and row.get("CE_Volume", 0) > 0:
            row["PCR_Volume"] = round(row["PE_Volume"] / row["CE_Volume"], 3)
        else:
            row["PCR_Volume"] = None

        summary_data.append(row)

    summary_df = pd.DataFrame(summary_data)
    print(f"   Summary: {len(summary_df)} symbols")
    return summary_df


def _find_col(df, candidates):
    for c in candidates:
        if c in df.columns:
            return c
        for col in df.columns:
            if col.strip().upper() == c.upper():
                return col
    return None


def save_data(df, filename, subdir=None):
    out_path = OUTPUT_DIR
    if subdir:
        out_path = out_path / subdir
        out_path.mkdir(exist_ok=True)
    filepath = out_path / filename
    df.to_csv(filepath, index=False)
    print(f"   Saved: {filepath}")
    return filepath


def main():
    parser = argparse.ArgumentParser(
        description="Download & analyze NSE F&O options data (bhavcopy)"
    )
    parser.add_argument("--date", "-d", help="Date (YYYY-MM-DD). Default: last trading day.")
    parser.add_argument("--range", "-r", nargs=2, metavar=("FROM", "TO"), help="Date range")
    parser.add_argument("--symbol", "-s", help="Filter by stock symbol")
    parser.add_argument("--summary-only", action="store_true", help="Only save summary")

    args = parser.parse_args()

    print("=" * 60)
    print("  NSE F&O Options Tracker v2")
    print("=" * 60)

    if args.range:
        start = datetime.strptime(args.range[0], "%Y-%m-%d")
        end = datetime.strptime(args.range[1], "%Y-%m-%d")
        dates = []
        current = start
        while current <= end:
            if current.weekday() < 5:
                dates.append(current)
            current += timedelta(days=1)
    elif args.date:
        dates = [datetime.strptime(args.date, "%Y-%m-%d")]
    else:
        today = datetime.now()
        if today.weekday() == 5:
            today -= timedelta(days=1)
        elif today.weekday() == 6:
            today -= timedelta(days=2)
        dates = [today]

    print(f"\nDates to process: {len(dates)}")
    print(f"Output directory: {OUTPUT_DIR.resolve()}\n")

    session = get_nse_session()
    all_summaries = []

    for date_obj in dates:
        date_label = date_obj.strftime("%Y-%m-%d")
        print(f"\n--- Processing: {date_label} ---")

        raw_df = download_bhavcopy(date_obj, session)
        if raw_df is None:
            continue

        options_df = filter_options(raw_df)

        if args.symbol:
            sym_col = _find_col(options_df, ["TckrSymb", "SYMBOL"])
            if sym_col:
                options_df = options_df[
                    options_df[sym_col].str.upper() == args.symbol.upper()
                ]
                print(f"   Filtered to {args.symbol}: {len(options_df)} contracts")

        if not args.summary_only:
            save_data(options_df, f"options_{date_obj.strftime('%Y%m%d')}.csv", subdir="raw")

        summary = summarize_options(options_df)
        summary["Date"] = date_label
        all_summaries.append(summary)
        save_data(summary, f"summary_{date_obj.strftime('%Y%m%d')}.csv", subdir="summaries")

        if len(dates) > 1:
            time.sleep(2)

    if len(all_summaries) > 1:
        combined = pd.concat(all_summaries, ignore_index=True)
        save_data(combined, "combined_summary.csv")

    if all_summaries:
        latest = all_summaries[-1]
        print(f"\nTotal unique symbols: {latest['Symbol'].nunique()}")

    print(f"\nDone! Check '{OUTPUT_DIR}' folder.")


if __name__ == "__main__":
    main()
