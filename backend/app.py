import streamlit as st
from data_preprocessing import load_and_preprocess_data
from langchain_core.output_parsers import StrOutputParser
from build_vector import building_vector_store
from retrieve_documents import retrieve_documents
from model import model
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough

@st.cache_data
def load_data():
    return load_and_preprocess_data('scraped_data.json')

@st.cache_resource
def load_model():
    return model()

@st.cache_resource(show_spinner="Building Vector Datastore...")
def get_vector_store(documents):
        return building_vector_store(documents)

template = """You are a helpful AI assistant for Jobsflow.ai. \
Greet the user politely and answer their question based on the following context. \
Always maintain a professional and friendly tone. \
Try to give meaningful answers to all the questions related to Jobsflow.

Context: {context}

Question: {question}

Instructions:
1. Provide concise, accurate answers related to Jobsflow.ai.
2. Use a maximum of three sentences in your response.
3. If the context doesn't contain relevant information, politely say: "I apologize, but I don't have enough information to answer that question about Jobsflow.ai. Is there anything else I can help you with?"
4. If you're unsure, admit it: "I'm not certain about that aspect of Jobsflow.ai. To ensure accuracy, I'd recommend checking the official website or contacting their support team."
5. Always stay within the scope of the provided context and Jobsflow.ai-related information.

Response:
"""

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

custom_rag_prompt = PromptTemplate.from_template(template)


def ui():
    st.set_page_config(page_title="Jobsflow.ai Assistant", page_icon="🤖")
    st.title("Chat with Jobsflow.ai website")
    st.write("Ask any question about the content on the website.")

    llm = load_model()
    documents = load_data()
        
    vector_store = get_vector_store(documents)
    retriever = retrieve_documents(vector_store)

    if "conversation" not in st.session_state:
        st.session_state.conversation = []

    if "user_input" not in st.session_state:
        st.session_state.user_input = ""

    def clear_input():
        st.session_state.user_input = st.session_state.widget
        st.session_state.widget = ""

    user_input = st.text_input("You: ", key="widget", on_change=clear_input, placeholder="Type your question here...")
    user_input = st.session_state.user_input

    if user_input:
        with st.spinner("Generating response..."):
            rag_chain = (
                {"context": retriever | format_docs, "question": RunnablePassthrough()}
                | custom_rag_prompt
                | llm
                | StrOutputParser()
            )

            response = rag_chain.invoke(user_input)
            st.session_state.conversation.append({"user": user_input, "bot": response})

    if st.session_state.conversation:
        for exchange in reversed(st.session_state.conversation):
            st.write(f"You: {exchange['user']}")
            st.write(f"Support Agent: {exchange['bot']}")
            st.write("----------")

if __name__ == "__main__":
    ui()
