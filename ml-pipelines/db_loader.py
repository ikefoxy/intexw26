"""
Shared database loader for ML pipelines.

Reads DB credentials from the repo-root .env file (same as the .NET backend
and load_csv_to_sql.py) and provides a simple load_table() function that
returns a pandas DataFrame for any table in the database.

Column names are automatically converted from PascalCase (EF Core convention)
to snake_case (pandas convention) so notebooks can use the same column names
they used when reading from CSVs.

Usage in notebooks:
    from db_loader import load_table
    residents = load_table('Residents')
"""

import os
import re
import urllib
import pandas as pd
from sqlalchemy import create_engine

_CSV_TO_TABLE = {
    "residents.csv": "Residents",
    "supporters.csv": "Supporters",
    "donations.csv": "Donations",
    "education_records.csv": "EducationRecords",
    "health_wellbeing_records.csv": "HealthWellbeingRecords",
    "intervention_plans.csv": "InterventionPlans",
    "incident_reports.csv": "IncidentReports",
    "process_recordings.csv": "ProcessRecordings",
    "home_visitations.csv": "HomeVisitations",
    "social_media_posts.csv": "SocialMediaPosts",
    "safehouses.csv": "Safehouses",
    "safehouse_monthly_metrics.csv": "SafehouseMonthlyMetrics",
    "partners.csv": "Partners",
    "partner_assignments.csv": "PartnerAssignments",
    "donation_allocations.csv": "DonationAllocations",
    "in_kind_donation_items.csv": "InKindDonationItems",
    "public_impact_snapshots.csv": "PublicImpactSnapshots",
}

_engine = None


def _find_env_file():
    """Walk up from this file's directory to find the repo-root .env."""
    d = os.path.dirname(os.path.abspath(__file__))
    for _ in range(10):
        candidate = os.path.join(d, ".env")
        if os.path.isfile(candidate):
            return candidate
        parent = os.path.dirname(d)
        if parent == d:
            break
        d = parent
    return None


def _load_env():
    path = _find_env_file()
    if path is None:
        return
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            eq = line.find("=")
            if eq <= 0:
                continue
            key = line[:eq].strip()
            value = line[eq + 1 :].strip()
            if key not in os.environ or not os.environ[key]:
                os.environ[key] = value


def _get_engine():
    global _engine
    if _engine is not None:
        return _engine

    _load_env()

    server = os.environ.get("DB_SERVER")
    database = os.environ.get("DB_NAME")
    user = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")

    if not all([server, database, user, password]):
        raise RuntimeError(
            "Missing DB credentials. Set DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD "
            "in the repo-root .env file or as environment variables."
        )

    driver = "{ODBC Driver 18 for SQL Server}"
    params = urllib.parse.quote_plus(
        f"Driver={driver};Server=tcp:{server},1433;Database={database};"
        f"Uid={user};Pwd={password};Encrypt=yes;"
        f"TrustServerCertificate=no;Connection Timeout=60;"
    )
    _engine = create_engine(
        f"mssql+pyodbc:///?odbc_connect={params}", fast_executemany=True
    )
    return _engine


_COLUMN_ALIASES = {
    "family_is4ps": "family_is_4ps",
}


def _to_snake_case(name: str) -> str:
    """Convert PascalCase / camelCase to snake_case, then apply known aliases."""
    s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", name)
    s = re.sub(r"([a-z\d])([A-Z])", r"\1_\2", s)
    s = s.lower()
    return _COLUMN_ALIASES.get(s, s)


def load_table(table_name: str) -> pd.DataFrame:
    """
    Load a full table from SQL Server as a DataFrame.

    Accepts either the SQL table name (e.g. 'Residents') or the original
    CSV filename (e.g. 'residents.csv') for backward compatibility.

    Column names are converted from PascalCase to snake_case so existing
    notebook code continues to work unchanged.
    """
    sql_name = _CSV_TO_TABLE.get(table_name, table_name)
    engine = _get_engine()
    df = pd.read_sql_table(sql_name, engine, schema="dbo")
    df.columns = [_to_snake_case(c) for c in df.columns]
    return df


def load_query(sql: str) -> pd.DataFrame:
    """Run an arbitrary SQL query and return a DataFrame."""
    engine = _get_engine()
    df = pd.read_sql(sql, engine)
    df.columns = [_to_snake_case(c) for c in df.columns]
    return df
