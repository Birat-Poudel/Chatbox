def retrieve_documents(vector_store):
    return vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 6})