from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

import shutil
import logging
from openai import OpenAI
from openai.types import Completion, CompletionChoice, CompletionUsage 
from qdrant_client import QdrantClient
from qdrant_client import models
from qdrant_client.http.models import Distance, VectorParams

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_qdrant import QdrantVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from uuid import uuid4


#initiate fast api and logging (global config)
app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(level=logging.INFO)
clientq = QdrantClient(url="http://localhost:6333")
openai_api_key = "your open ai key"

# Initialize OpenAI Embeddings and Qdrant col name and openai client
embedding_model = OpenAIEmbeddings(api_key=openai_api_key)
clientopenai = OpenAI(
    api_key=openai_api_key,  # This is the default and can be omitted
)
collection_name = "demo_candidates"


# Check if the collection exists just create it when its `not` already exist 
collections = clientq.get_collections()
existing_collections = [col.name for col in collections.collections]

# changes to "in" (for me to easy delete the collection or recreate)
if collection_name not in existing_collections:
    clientq.delete_collection(collection_name)
    clientq.create_collection(
        collection_name="demo_candidates",
        vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
    )

# Initialize Qdrant vector store
vectorstore = QdrantVectorStore(
    client=clientq,
    collection_name="demo_candidates",
    embedding=embedding_model,
)

# Candidate model for json input request
class Candidate(BaseModel):
    id: str
    description: str
    
def load_pdf(pdf_path):
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    return documents

@app.post("/candidate")
async def add_candidate(candidate: Candidate):
    try:
        # Load and split the text
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_text(candidate.description)

        # Wrap each chunk in a Document object with proper structure
        documents = []
        candidate_id = str(uuid4())
        for chunk in chunks:
            documents.append(Document(page_content=chunk, metadata={"source": "candidate", "candidate_id": candidate_id}))


        # Add text chunks to Qdrant
        vectorstore.add_documents(documents=documents)

        logging.info(f"Added candidate: {candidate.id}")
        return {"message": "Candidate added successfully"}
    except Exception as e:
        logging.error(f"Error adding candidate: {e}")
        raise HTTPException(status_code=500, detail="Could not add candidate")

@app.post("/candidate/pdf")
async def add_candidate_pdf(file: UploadFile = File(...)):
    try:
        # save the uploaded PDF file to a temporary location
        with open(f"temp/{file.filename}", "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # load and split the text
        documents = load_pdf(f"temp/{file.filename}")
        
        # spliter better use RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_documents(documents)
        candidate_id = str(uuid4())
        for chunk in chunks:
            # this take a long time turns out chunk already have property page_content but i am not sure all have that so just to make sure
            if isinstance(chunk, str):
                page_content = chunk
            elif isinstance(chunk, Document):
                page_content = chunk.page_content
            else:
                raise ValueError("Chunk is not a valid string or Document object.")
            documents.append(Document(page_content=page_content, metadata={"source": "candidate", "candidate_id": candidate_id}))
        
        # Add text chunks to qdrant
        vectorstore.add_documents(documents=documents)

        logging.info(f"Uploaded and added file: {file.filename}")
        return {"message": "Candidate PDF uploaded and embedded successfully"}
    except Exception as e:
        logging.error(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail="Could not process the file")

@app.post("/candidate/query")
async def query_candidates(query: str):
    try:
        print(query)
        # Perform similarity search in Qdrant
        results = vectorstore.similarity_search(
            query=query,
            k=3,                   
        )

        # Extract matches
        matches = [
            {"id": result.metadata.get("candidate_id", "Unknown"), "text": result.page_content}
            for result in results
        ]

        # Format results for OpenAI
        result_texts = "\n".join(
            [f"Candidate ID: {match['id']}, Description: {match['text']}" for match in matches]
        )
        prompt = (
            f"You are an expert HR assistant. A user asked: '{query}'. Based on the following "
            f"candidate descriptions, respond conversationally:\n\n{result_texts}"
        )

        # Generate a human-like response using OpenAI
        openai_response = clientopenai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        
        print(openai_response.choices)

        conversational_response = openai_response.choices[0].message.content

        logging.info(f"Querying candidates with: {query}")
        return {"response": conversational_response, "matches": matches}
    except Exception as e:
        logging.error(f"Error querying candidates: {e}")
        raise HTTPException(status_code=500, detail="Could not query candidates")
