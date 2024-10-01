from langchain_community.vectorstores import FAISS
from langchain.text_splitter import CharacterTextSplitter
from embeddings import get_embeddings
from yaml import safe_load

def build_vector_store(documents, config_path="config.yml"):
    with open(config_path, 'r') as f:
        config = safe_load(f)

    chunk_size = config['vector_store']['chunk_size']
    chunk_overlap = config['vector_store']['chunk_overlap']
    text_splitter = CharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    
    texts = [text_splitter.split_text(doc['content']) for doc in documents]
    texts = [item for sublist in texts for item in sublist]  
    
    embeddings = get_embeddings(config_path)
    
    vector_store = FAISS.from_texts(texts, embeddings)
    
    return vector_store
