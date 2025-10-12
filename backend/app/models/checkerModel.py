import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def tokenize_code(code, lang=None):
    """
    Tokenizes code for Python, C, C++, Java, JavaScript.
    Normalizes:
      - Identifiers -> VAR
      - Numbers -> NUM
      - Strings -> STR
      - Removes comments
    """
    # Remove single-line comments
    if lang in ["python"]:
        code = re.sub(r'#.*', '', code)
    if lang in ["c", "cpp", "java", "js"]:
        code = re.sub(r'//.*', '', code)
        
    # Remove multi-line comments (all languages that support /* */)
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    
    # Replace identifiers (variables, functions, class names)
    code = re.sub(r'\b[_a-zA-Z][_a-zA-Z0-9]*\b', 'VAR', code)
    
    # Replace numbers
    code = re.sub(r'\b\d+\b', 'NUM', code)
    
    # Replace string literals
    code = re.sub(r'(["\'])(?:(?=(\\?))\2.)*?\1', 'STR', code)
    
    # Split code into tokens
    tokens = re.findall(r'\w+|\S', code)
    
    return ' '.join(tokens)



def vectorize_codes(tokenized_codes):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(tokenized_codes)
    return tfidf_matrix

def compute_similarity(tfidf_matrix):
    return cosine_similarity(tfidf_matrix)


def show_top_matches(sim_matrix, code_names, top_k=5):
    for i in range(len(code_names)):
        sims = sim_matrix[i]
        sorted_idx = np.argsort(-sims)  # descending order
        print(f"\nCode '{code_names[i]}' top {top_k} similar codes:")
        for j in sorted_idx[1:top_k+1]:  # skip self
            print(f"  -> '{code_names[j]}': Similarity = {sims[j]:.3f}")
