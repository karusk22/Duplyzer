from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from ..models.checkerModel import tokenize_code, vectorize_codes, compute_similarity
import numpy as np

checkRouter = APIRouter()

class CodeRequest(BaseModel):
    codes: List[str]
    lang: str = "python"

@checkRouter.post("/check")
def check_similarity(req: CodeRequest):
    codes = req.codes
    lang = req.lang

    tokenized_codes = [tokenize_code(code, lang) for code in codes]
    
    tfidf_matrix = vectorize_codes(tokenized_codes)
    
    sim_matrix = compute_similarity(tfidf_matrix)
    print(sim_matrix)
    results = []
    for i in range(len(codes)):
        sims = sim_matrix[i]
        sorted_idx = np.argsort(-sims)
        top_matches = []
        for j in sorted_idx[1:6]:  
            top_matches.append({
                "code_index": int(j),                 
                "similarity": round(float(sims[j]),3) 
            })
        results.append({
            "code_index": int(i), 
            "top_matches": top_matches
        })
    
    return {"similarity_results": results}
