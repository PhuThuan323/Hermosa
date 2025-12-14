import pandas as pd
from collections import defaultdict
import json
import logging
import time

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler("item_item_train.log", mode="w"),
        logging.StreamHandler()
    ]
)

start_time = time.time()
logging.info("START training item-to-item recommendation")

df = pd.read_csv("events.csv")
logging.info(f"Raw rows: {len(df):,}")

df = df[df["event"].isin(["add_to_cart", "buy"])]
logging.info(f"After filter events: {len(df):,}")

df = df.sort_values(["visitorid", "timestamp"])

event_weight = {
    "add_to_cart": 3,
    "buy": 5
}

MAX_WINDOW = 5  

co_occurrence = defaultdict(lambda: defaultdict(int))
visitor_count = 0
pair_count = 0

for visitor, group in df.groupby("visitorid"):
    visitor_count += 1
    products = group[["productID", "event"]].values

    seq_len = len(products)
    if seq_len > 50:
        logging.warning(
            f"Visitor {visitor} has long sequence: {seq_len}"
        )

    for i in range(seq_len):
        p_i, _ = products[i]

        # chỉ xét K sản phẩm phía sau
        for j in range(i + 1, min(i + 1 + MAX_WINDOW, seq_len)):
            p_j, e_j = products[j]

            if p_i != p_j:
                co_occurrence[p_i][p_j] += event_weight[e_j]
                pair_count += 1

    if visitor_count % 10000 == 0:
        logging.info(
            f"Processed {visitor_count:,} visitors | "
            f"Pairs: {pair_count:,}"
        )

logging.info(f"Total visitors processed: {visitor_count:,}")
logging.info(f"Total item-item pairs counted: {pair_count:,}")

final_rec = {
    k: sorted(v.items(), key=lambda x: x[1], reverse=True)[:10]
    for k, v in co_occurrence.items()
}

logging.info(f"Total unique products: {len(final_rec):,}")

with open("item_item_recommend.json", "w", encoding="utf-8") as f:
    json.dump(final_rec, f, ensure_ascii=False)

logging.info("Saved item_item_recommend.json")

elapsed = time.time() - start_time
logging.info(f"FINISHED in {elapsed:.2f} seconds")
