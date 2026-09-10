import { useState, useEffect } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [images, setImages] = useState([])
  const [previewId, setPreviewId] = useState(null)

  const fetchImages = async () => {
    try {
      const res = await fetch('http://localhost:8000/images')
      const data = await res.json()
      setImages(data)
    } catch (error) {
      console.error("Erro ao buscar imagens:", error)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData
    })
    
    setFile(null)
    e.target.reset()
    fetchImages()
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Upload de Imagens</h2>
      <form onSubmit={handleUpload} style={{ marginBottom: '30px' }}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          accept="image/*"
          required 
        />
        <button type="submit" style={{ marginLeft: '10px' }}>Salvar no Banco</button>
      </form>

      <h2>Imagens Salvas</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '600px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>ID</th>
            <th>Nome do Arquivo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {images.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>Nenhuma imagem cadastrada.</td>
            </tr>
          ) : (
            images.map(img => (
              <tr key={img.id} style={{ textAlign: 'center' }}>
                <td>{img.id}</td>
                <td>{img.filename}</td>
                <td>
                  <button onClick={() => setPreviewId(img.id)}>
                    Pré-visualizar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {previewId && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', maxWidth: '600px' }}>
          <h3>Visualizando Imagem (ID: {previewId})</h3>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <img 
              src={`http://localhost:8000/images/${previewId}`} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} 
            />
          </div>
          <button onClick={() => setPreviewId(null)}>
            Fechar Visualização
          </button>
        </div>
      )}
    </div>
  )
}

export default App