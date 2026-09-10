from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

# Permite que o frontend React se comunique com a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão simples com SQLite
def get_db():
    conn = sqlite3.connect("images.db", check_same_thread=False)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            data BLOB
        )
    """)
    return conn

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Lê os bytes da imagem
    image_data = await file.read()
    
    # Salva no banco de dados
    cursor.execute("INSERT INTO images (filename, data) VALUES (?, ?)", (file.filename, image_data))
    conn.commit()
    
    return {"message": "Imagem salva com sucesso!"}

@app.get("/images")
def list_images():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, filename FROM images")
    
    # Retorna apenas os IDs e Nomes para montar a tabela
    return [{"id": row[0], "filename": row[1]} for row in cursor.fetchall()]

@app.get("/images/{image_id}")
def get_image(image_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM images WHERE id = ?", (image_id,))
    row = cursor.fetchone()
    
    if row:
        # Retorna a imagem em si para ser renderizada no navegador
        return Response(content=row[0], media_type="image/jpeg")
    return {"error": "Imagem não encontrada"}