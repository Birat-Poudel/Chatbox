import requests
from bs4 import BeautifulSoup
import json

BASE_URL = 'https://jobsflow.ai/en'

pages = {
    'Home': BASE_URL,
    'About Us': f'{BASE_URL}/about', 
    'Blog': f'{BASE_URL}/blogs/first-post'  
}

data = {}

def extract_text_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text(separator='\n', strip=True)
        return text
    else:
        return f"Failed to retrieve the page. Status code: {response.status_code}"

for page_name, page_url in pages.items():
    print(f"Extracting text from: {page_name} ({page_url})")
    text = extract_text_from_url(page_url)
    data[page_name] = text

with open('scraped_data.json', 'w') as f:
    json.dump(data, f, indent=4)