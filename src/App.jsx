import { useState } from 'react'

export default function App() {
  const [elements, setElements] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleAddElement = (type) => {
    const newElement = {
      id: Date.now(),
      type: type,
      text: type === 'button' ? 'Click me' : type === 'text' ? 'Sample text' : 'Container',
      backgroundColor: type === 'div' ? '#e0e0e0' : '#ffffff',
      x: 50,
      y: 50,
      width: type === 'div' ? 200 : 'auto',
      height: type === 'div' ? 100 : 'auto',
    }
    setElements([...elements, newElement])
    setSelectedId(newElement.id)
  }

  // Handle text property change
  const handleTextChange = (id, newText) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, text: newText } : el
    ))
  }

  // Handle color property change
  const handleColorChange = (id, newColor) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, backgroundColor: newColor } : el
    ))
  }

  // Delete selected element
  const handleDeleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id))
    setSelectedId(null)
  }

  // Drag start
  const handleMouseDown = (e, id) => {
    e.preventDefault()
    const element = elements.find(el => el.id === id)
    setDraggingId(id)
    setSelectedId(id)
    setDragOffset({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    })
  }

  // Drag move
  const handleMouseMove = (e) => {
    if (draggingId === null) return

    const canvas = document.getElementById('canvas')
    const canvasRect = canvas.getBoundingClientRect()

    let newX = e.clientX - canvasRect.left - dragOffset.x
    let newY = e.clientY - canvasRect.top - dragOffset.y

    // Keep elements within canvas bounds
    newX = Math.max(0, Math.min(newX, canvasRect.width - 100))
    newY = Math.max(0, Math.min(newY, canvasRect.height - 50))

    setElements(elements.map(el =>
      el.id === draggingId ? { ...el, x: newX, y: newY } : el
    ))
  }

  // Drag end
  const handleMouseUp = () => {
    setDraggingId(null)
  }

  const selectedElement = elements.find(el => el.id === selectedId)

  // Generate code for selected element
  const generateElementCode = (element) => {
    let code = ''
    
    if (element.type === 'button') {
      code = `<button style={{\n  padding: '8px 16px',\n  backgroundColor: 'green',\n  color: 'white',\n  border: 'none',\n  borderRadius: '4px',\n  cursor: 'pointer'\n}}\n>\n  ${element.text}\n</button>`
    } else if (element.type === 'text') {
      code = `<span style={{\n  color: '#333',\n  fontSize: '14px',\n  backgroundColor: '${element.backgroundColor}'\n}}\n>\n  ${element.text}\n</span>`
    } else if (element.type === 'div') {
      code = `<div style={{\n width: '200px',\n  height: '100px',\n  backgroundColor: '${element.backgroundColor}',\n  display: 'flex',\n  alignItems: 'center',\n  justifyContent: 'center',\n  border: '2px dashed #999'\n}}\n>\n  ${element.text}\n</div>`
    }
    
    return code
  }

  return (
    <div style={styles.appContainer} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <h1 style={styles.title}>Drag & Drop UI Builder</h1>
        <div style={styles.buttonGroup}>
          <button style={styles.toolbarButton} onClick={() => handleAddElement('button')}>
            + Add Button
          </button>
          <button style={styles.toolbarButton} onClick={() => handleAddElement('text')}>
            + Add Text
          </button>
          <button style={styles.toolbarButton} onClick={() => handleAddElement('div')}>
            + Add Container
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Canvas */}
        <div
          id="canvas"
          style={styles.canvas}
          onClick={() => setSelectedId(null)}
        >
          {elements.length === 0 && (
            <p style={styles.emptyText}>Click a button above to add elements</p>
          )}

          {elements.map(element => (
            <div
              key={element.id}
              style={{
                ...styles.element,
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                backgroundColor: element.backgroundColor,
                width: element.width !== 'auto' ? `${element.width}px` : 'auto',
                height: element.height !== 'auto' ? `${element.height}px` : 'auto',
                border: selectedId === element.id ? '2px solid #2196F3' : '2px solid #999',
                cursor: 'move',
                ...(element.type === 'button' && styles.buttonElement),
                ...(element.type === 'text' && styles.textElement),
                ...(element.type === 'div' && styles.divElement),
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedId(element.id)
              }}
            >
              {element.type === 'button' && (
                <button
                  style={styles.buttonContent}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  disabled
                >
                  {element.text}
                </button>
              )}
              {element.type === 'text' && (
                <span style={styles.textContent}>{element.text}</span>
              )}
              {element.type === 'div' && (
                <div style={styles.divContent}>{element.text}</div>
              )}
            </div>
          ))}
        </div>

        {/* Properties Panel */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Properties</h2>
          {selectedElement ? (
            <div>
              <p style={styles.info}>
                <strong>Type:</strong> {selectedElement.type}
              </p>

              {(selectedElement.type === 'button' || selectedElement.type === 'text') && (
                <div style={styles.propertyGroup}>
                  <label style={styles.label}>Text:</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={selectedElement.text}
                    onChange={(e) => handleTextChange(selectedElement.id, e.target.value)}
                  />
                </div>
              )}

              <div style={styles.propertyGroup}>
                <label style={styles.label}>Background Color:</label>
                <div style={styles.colorInputWrapper}>
                  <input
                    type="color"
                    style={styles.colorInput}
                    value={selectedElement.backgroundColor}
                    onChange={(e) => handleColorChange(selectedElement.id, e.target.value)}
                  />
                  <span style={styles.colorValue}>{selectedElement.backgroundColor}</span>
                </div>
              </div>

              <p style={styles.info}>
                <strong>Position:</strong> X: {Math.round(selectedElement.x)}, Y: {Math.round(selectedElement.y)}
              </p>

              <button
                style={styles.deleteButton}
                onClick={() => handleDeleteElement(selectedElement.id)}
              >
                Delete Element
              </button>

              <div style={styles.codeSection}>
                <label style={styles.label}>Generated Code:</label>
                <div style={styles.codeBox}>
                  <code style={styles.code}>
                    {generateElementCode(selectedElement)}
                  </code>
                </div>
                <button
                  style={styles.copyButton}
                  onClick={() => {
                    navigator.clipboard.writeText(generateElementCode(selectedElement))
                    alert('Code copied to clipboard!')
                  }}
                >
                  Copy Code
                </button>
              </div>
            </div>
          ) : (
            <p style={styles.noSelection}>Select an element to edit properties</p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '15px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  toolbarButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    fontSize: '14px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    gap: '10px',
    padding: '15px',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#fff',
    border: '2px solid #999',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: '20px',
    fontSize: '14px',
  },
  element: {
    padding: '8px',
    borderRadius: '4px',
    transition: 'box-shadow 0.2s',
    userSelect: 'none',
  },
  buttonElement: {
    minWidth: '80px',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  textElement: {
    minHeight: '24px',
    padding: '4px 8px',
  },
  textContent: {
    fontSize: '14px',
    color: '#333',
  },
  divElement: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #999',
  },
  divContent: {
    color: '#666',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  panel: {
    width: '280px',
    backgroundColor: '#fff',
    border: '2px solid #999',
    borderRadius: '4px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflowY: 'auto',
  },
  panelTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '2px solid #2196F3',
    paddingBottom: '10px',
  },
  propertyGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  colorInputWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  colorInput: {
    width: '50px',
    height: '40px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  colorValue: {
    fontSize: '13px',
    color: '#666',
    fontFamily: 'monospace',
  },
  info: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '10px',
  },
  noSelection: {
    fontSize: '13px',
    color: '#999',
    fontStyle: 'italic',
  },
  deleteButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  codeSection: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '2px solid #e0e0e0',
  },
  codeBox: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
    maxHeight: '150px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: '1.4',
  },
  code: {
    color: '#333',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  copyButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  },
}
