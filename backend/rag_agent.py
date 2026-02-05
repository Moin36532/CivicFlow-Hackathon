import google.generativeai as genai
import os
import json
import opik
try:
    from backend.database import get_open_issues
except ImportError:
    from database import get_open_issues

# Configure Opik (Safety Tracking)
if os.environ.get("OPIK_API_KEY"):
    opik.configure(use_local=False)

# Mock Knowledge Base (Laws/Rules)
KNOWLEDGE_BASE = {
    "Local Govt Act": "The Punjab Local Government Act 2013 requires the Municipal Corporation to maintain public streets, remove refuse, and provide street lighting. Section 11-B mandates response to hazard reports within 7 days.",
    "Environmental Protection": "The Environmental Protection Act prohibits the discharge of untreated sewage into public water bodies. Violators are subject to fines up to 50,000 PKR.",
    "Traffic Rules": "Obstructing public flow of traffic is a punishable offense under the Motor Vehicles Ordinance 1965.",
    "Citizen Rights": "Every citizen has the right to clean drinking water and a safe environment under Article 9 of the Constitution."
}

@opik.track(name="RAG Retriever")
def retrieve_documents(query):
    """
    Simple retrieval: specific laws + relevant issues from DB.
    """
    context = []
    
    # 1. Retrieve relevant Laws (Keyword match)
    query_lower = query.lower()
    for title, text in KNOWLEDGE_BASE.items():
        if any(word in query_lower for word in title.lower().split()) or \
           any(word in query_lower for word in ["law", "act", "rule", "legal", "right"]):
             context.append(f"LAW ({title}): {text}")

    # 2. Retrieve relevant Issues from DB
    issues = get_open_issues()
    relevant_issues = [
        f"ISSUE #{i['id']} ({i['title']}): {i['description']} (Status: {i['status']})"
        for i in issues 
        if i['title'].lower() in query_lower or i['description'].lower() in query_lower or "issue" in query_lower
    ]
    
    # Cap to 5 issues to save context
    context.extend(relevant_issues[:5])
    
    if not context:
        return "No specific documents found. Answering based on general knowledge."
    
    return "\n".join(context)

@opik.track(name="RAG Chatbot")
def chat_rag_agent(query, use_docs=True):
    """
    RAG Chatbot: Answers query using context if requested.
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return "I'm sorry, my brain (API Key) is missing. I can't think right now."

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash-lite')

    if use_docs:
        context = retrieve_documents(query)
        prompt = f"""
        You are 'CivicBot', a helpful assistant for the CivicFlow app.
        
        CONTEXT (Laws & Issues):
        {context}
        
        USER QUERY: "{query}"
        
        INSTRUCTIONS:
        - Answer the user's query helping them understand laws or status of issues.
        - If the context mentions specific laws, cite them.
        - Be friendly and professional.
        - If context is empty, just use your general knowledge but mention you didn't find specific internal records.
        """
    else:
        prompt = f"""
        You are 'CivicBot', a helpful assistant for the CivicFlow app.
        USER QUERY: "{query}"
        Instructions: Chat kindly with the user. Do not make up laws or specific issue details.
        """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"I encountered an error thinking about that: {e}"
