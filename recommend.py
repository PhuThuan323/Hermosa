import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi import Query
import numpy as np
import uvicorn 
import train_collab as collaborative
import train_trans as transformer

app = FastAPI()

#hàm gợi ý sản phẩm bạn có thể thích
@app.get("/recommend/also_liked/{visitorid}")
def api_recommend(visitorid: str, num: int = 7):
    recs = collaborative.recommend_for_user(visitorid, num)
    return {
        "visitorid": visitorid,
        "total": len(recs),
        "data": recs
    }

@app.get("/recommend/also_viewed/{visitor_id}")
def api_also_viewed(visitor_id: str, exclude_items: list[str] = Query(default=[]), num: int = 10):
    items = collaborative.also_viewed(visitor_id, exclude_items, num)
    return {
        "visitor_id": visitor_id,
        "total": len(items),
        "data": items
    }


# Gợi ý những item có thể người dùng sẽ thích -> prediction item based on current item
@app.get("/recommend/next_item/{productID}")
def api_next_item(productID: str, top_k: int = 5):
    recs = transformer.recommend_additional(productID, top_k)
    return {
        "productID": productID,
        "data": recs
    }

if __name__ == "__main__":
    uvicorn.run("recommend:app", host="0.0.0.0", port=8001, reload=True)
