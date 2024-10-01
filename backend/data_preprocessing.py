import json

def load_and_preprocess_data(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)

    documents = []
    for page_name, text in data.items():
        cleaned_text = text.replace("\n", " ")
        documents.append({'title': page_name, 'content': cleaned_text})
    
    return documents
