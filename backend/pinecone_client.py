import os
import json
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from embeddings import get_embeddings

load_dotenv(dotenv_path=".env.local")

pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")
pinecone_namespace = os.getenv("PINECONE_NAMESPACE")

def get_pinecone_client():
    pc = Pinecone(api_key=pinecone_api_key)
    return pc

def get_vector_store(pc: Pinecone):
    embeddings = get_embeddings()
    vector_store = PineconeVectorStore.from_existing_index(
        embedding=embeddings,
        index_name=os.getenv("PINECONE_INDEX"),
        namespace=os.getenv("PINECONE_NAMESPACE"),
        text_key="text",
    )
    return vector_store

def load_json_data(json_file):
    with open(json_file, "r") as file:
        data = json.load(file)
    return data

def insert_data_into_pinecone(json_file):
    pc = get_pinecone_client()
    embeddings = get_embeddings()

    vector_store = PineconeVectorStore.from_existing_index(
        embedding=embeddings,
        index_name=pinecone_index,
        namespace=pinecone_namespace,
        text_key="text",
    )

    data = load_json_data(json_file)

    for section, content in data.items():  
        if isinstance(content, str):  
            text = content.strip() 
            if text:
                metadata = {"section": section}  
                embedding = embeddings.embed_query(text)  

                vector_store.add_texts(
                    texts=[text],
                    metadatas=[metadata],
                    ids=None  
                )
        else:
            print(f"Unexpected content format in section {section}: {type(content)}. Skipping.")

    print(f"Data from {json_file} inserted into Pinecone successfully.")

json_file_path = "scraped_data.json"
# insert_data_into_pinecone(json_file_path)