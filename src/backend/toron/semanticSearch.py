from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")


def semantic_relevant_memory(memory, query, k=5):
    """Return the top-k relevant past messages based on embeddings."""
    if not memory or not memory.get("messages"):
        return []

    query_emb = model.encode(query)
    messages = memory["messages"]

    scored = []
    for m in messages:
        emb = model.encode(m["text"])
        score = util.cos_sim(query_emb, emb).item()
        scored.append((score, m))

    scored.sort(reverse=True, key=lambda x: x[0])
    return [m for (_, m) in scored[:k]]
