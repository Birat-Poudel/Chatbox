from langchain_huggingface import HuggingFaceEmbeddings
from yaml import safe_load

def get_embeddings(config_path="config.yml"):
    with open(config_path, 'r') as f:
        config = safe_load(f)
        
    model_name = config['model']['embeddings_model']
    embeddings = HuggingFaceEmbeddings(model_name=model_name)
    
    return embeddings