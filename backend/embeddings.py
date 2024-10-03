from langchain_cohere import CohereEmbeddings
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=".env.local")

def get_embeddings():
    cohere_embeddings = CohereEmbeddings(
        cohere_api_key=os.getenv("COHERE_API_KEY"), model="embed-english-v3.0"
    )
    return cohere_embeddings