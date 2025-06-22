# %%
import pandas as pd
from sqlalchemy import create_engine
import pandas as pd
from dotenv import load_dotenv
import json
import os

load_dotenv()

USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DATABASE = os.getenv("DATABASE")

engine = create_engine(
    f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}"
)

datas = [
    {"name": "a", "init": 1, "jdata": [{"a": "0"}, {"f": "5"}]},
    {"name": "b", "init": 2, "jdata": [{"b": "1"}, {"g": "6"}]},
    {"name": "c"},
    {"name": "d", "init": 4, "jdata": [{"c": "2"}, {"h": "7"}]},
    {"name": "e", "init": 5, "jdata": [{"d": "3"}, {"i": "8"}]},
    {"name": "f", "init": 6, "jdata": [{"e": "4"}, {"j": "9"}]},
]
df = pd.DataFrame(datas)
# %%
df["init"] = df["init"].apply(lambda x: str(int(x)) if pd.notna(x) else None)
df["jdata"] = df["jdata"].apply(
    lambda x: json.dumps(x) if isinstance(x, list) else None
)
df.to_sql("sample", engine, if_exists="append", index=False)
