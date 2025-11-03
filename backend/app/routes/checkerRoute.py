from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from ..models.checkerModel import tokenize_code, vectorize_codes, compute_similarity
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
import os

checkRouter = APIRouter()


class CodeRequest(BaseModel):
    codes: List[str]
    lang: str = "python"


@checkRouter.post("/check")
def check_similarity(req: CodeRequest):
    codes = req.codes
    lang = req.lang

    # 1️⃣ Tokenize and compute similarity
    tokenized_codes = [tokenize_code(code, lang) for code in codes]
    tfidf_matrix = vectorize_codes(tokenized_codes)
    sim_matrix = compute_similarity(tfidf_matrix)

    # 2️⃣ Build similarity results for each code
    results = []
    for i in range(len(codes)):
        sims = sim_matrix[i]
        sorted_idx = np.argsort(-sims)
        top_matches = []
        for j in sorted_idx[1:6]:  # top 5
            top_matches.append({
                "code_index": int(j),
                "similarity": round(float(sims[j]), 3)
            })
        results.append({
            "code_index": int(i),
            "top_matches": top_matches
        })

    # 3️⃣ Plot similarity bar chart
    n = len(sim_matrix)
    users = [f"User {i+1}" for i in range(n)]
    x = np.arange(n)
    bar_width = 0.15

    plt.figure(figsize=(10, 6))
    for j in range(n):
        sims_to_others = [sim_matrix[i][j] if i != j else 0 for i in range(n)]
        plt.bar(x + j * bar_width, sims_to_others, width=bar_width, label=f"vs User {j+1}")

    plt.xticks(x + bar_width * (n / 2), users)
    plt.xlabel("User")
    plt.ylabel("Similarity Score")
    plt.title("Code Similarity of Each User Against All Others")
    plt.ylim(0, 1.05)
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=8)

    # 4️⃣ Save image to static directory
    static_dir = os.path.join(os.getcwd(), "static")
    os.makedirs(static_dir, exist_ok=True)
    image_filename = "user_vs_user_similarity.png"
    image_path = os.path.join(static_dir, image_filename)
    plt.savefig(image_path, format="png", bbox_inches="tight")
    plt.close()

    # 5️⃣ Return data and image URL
    return {
        "similarity_results": results,
        "similarity_matrix": sim_matrix.tolist(),
        "image_url": f"http://localhost:8000/static/{image_filename}"
    }
