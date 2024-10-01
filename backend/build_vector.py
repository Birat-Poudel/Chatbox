from vector_store import build_vector_store

def building_vector_store(documents):
    return build_vector_store(documents, config_path="config.yml")
    