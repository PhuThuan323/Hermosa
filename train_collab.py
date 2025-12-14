print("🚀 Chạy Item-based Collaborative Filtering...")

import os
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity


print("📚 Loading data...")
BASE_DIR = os.path.dirname(__file__)
file_path = os.path.join(BASE_DIR, "events.csv")
df = pd.read_csv(file_path)
print(f"Loaded {len(df)} rows.")



event_weight = {"view": 1, "like": 2, "add_to_cart": 3, "buy": 5}
df["weight"] = df["event"].map(event_weight)

df["user_id"] = df["visitorid"].astype("category").cat.codes
df["item_id"] = df["productID"].astype("category").cat.codes

user_decoder = dict(enumerate(df["visitorid"].astype("category").cat.categories))
item_decoder = dict(enumerate(df["productID"].astype("category").cat.categories))

df["norm_weight"] = df.groupby("visitorid")["weight"].transform(
    lambda x: x / (1 + np.log1p(x.sum()))
)

item_pop = df.groupby("item_id")["visitorid"].nunique()
idf = np.log(len(item_pop) / (1 + item_pop))
df["tfidf_weight"] = df["norm_weight"] * df["item_id"].map(idf)

df["tfidf_weight"] = df["tfidf_weight"].clip(upper=5)

matrix = csr_matrix(
    (df["tfidf_weight"], (df["user_id"], df["item_id"]))
)


print("⏳ Computing cosine similarity...")
item_similarity = cosine_similarity(matrix.T)
print("👍 Done!")


def recommend_for_user(visitorid, num=7):
    try:
        uid = list(user_decoder.keys())[list(user_decoder.values()).index(visitorid)]
    except ValueError:
        return []

    user_row = matrix[uid].toarray().flatten()
    interacted_items = np.where(user_row > 0)[0]

    if len(interacted_items) == 0:
        return []

    scores = np.zeros(item_similarity.shape[0])

    for item in interacted_items:
        scores += item_similarity[item] * np.sqrt(user_row[item])

    scores[interacted_items] = -1
    top_items = np.argsort(scores)[-num:][::-1]

    return [(item_decoder[i], float(scores[i])) for i in top_items]


def also_viewed(visitorid, exclude_items=None, num=7):
    if exclude_items is None:
        exclude_items = []
    else:
        exclude_items = list(exclude_items)

    user_views = df[(df["visitorid"] == visitorid) & (df["event"] == "view")]["productID"].unique()

    exclude_items = set(exclude_items + list(user_views))

    if len(user_views) == 0:
        return []

    similar_users = df[
        (df["productID"].isin(user_views)) &
        (df["visitorid"] != visitorid) &
        (df["event"] == "view")
    ]["visitorid"].unique()

    if len(similar_users) == 0:
        return []

    other_views = df[
        (df["visitorid"].isin(similar_users)) &
        (df["event"] == "view")
    ]["productID"]

    freq = other_views.value_counts()
    freq = freq[~freq.index.isin(exclude_items)]
    freq = freq.head(num)

    return [{"productID": pid, "views": int(count)} for pid, count in freq.items()]


# ============================
# TEST
# ============================

# test_user = '690d583c81db5d6a42009e02'  # user xuất hiện nhiều nhất
# print("---")
# print("🔎 Bắt đầu kiểm tra hàm gợi ý...")
# print("Recommend for:", test_user)

# recommendations = recommend_for_user(test_user)
# print("Gợi ý sản phẩm dựa trên hành vi của người dùng:")
# print(recommendations)

# print("Gợi ý sản phẩm dựa trên những sản phẩm người dùng khác cũng xem:")
# also_view = also_viewed(test_user, exclude_items=['C01'])
# print(also_view)
