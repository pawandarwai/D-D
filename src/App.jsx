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
      backgroundColor: type === 'div' ? '#e0e0e0' : type === 'button' ? '#6c5ce7' : 'transparent',
      textColor: type === 'div' || type === 'text' ? '#333333' : '#ffffff',
      x: 50,
      y: 50,
      width: type === 'div' ? '200' : 'auto',
      height: type === 'div' ? '100' : 'auto',
      borderRadius: '4',
      fontSize: '14'
    }
    setElements([...elements, newElement])
    setSelectedId(newElement.id)
  }

  // Handle generic property changes
  const handlePropertyChange = (id, property, value) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, [property]: value } : el
    ))
  }

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

    // Keep elements roughly within canvas bounds
    newX = Math.max(0, Math.min(newX, canvasRect.width - 20))
    newY = Math.max(0, Math.min(newY, canvasRect.height - 20))

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
    const commonStyles = `
  x: '${element.x}px',
  y: '${element.y}px',
  backgroundColor: '${element.backgroundColor}',
  color: '${element.textColor}',
  width: '${element.width === 'auto' ? 'auto' : element.width + 'px'}',
  height: '${element.height === 'auto' ? 'auto' : element.height + 'px'}',
  borderRadius: '${element.borderRadius}px',
  fontSize: '${element.fontSize}px',
`
    
    if (element.type === 'button') {
      return `<button style={{\n${commonStyles}  padding: '8px 16px',\n  border: 'none',\n  cursor: 'pointer'\n}}>\n  ${element.text}\n</button>`
    } else if (element.type === 'text') {
      return `<span style={{\n${commonStyles}}}>\n  ${element.text}\n</span>`
    } else if (element.type === 'div') {
      return `<div style={{\n${commonStyles}  display: 'flex',\n  alignItems: 'center',\n  justifyContent: 'center'\n}}>\n  ${element.text}\n</div>`
    }
    return ''
  }

  return (
    <div className="app-container" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Toolbar */}
      <div className="toolbar">
        <h1 className="toolbar-title">UI Builder Pro</h1>
        <div className="button-group">
          <button className="toolbar-button" onClick={() => handleAddElement('button')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            Button
          </button>
          <button className="toolbar-button" onClick={() => handleAddElement('text')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
            Text
          </button>
          <button className="toolbar-button" onClick={() => handleAddElement('div')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            Container
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Canvas */}
        <div className="canvas-wrapper">
          <div
            id="canvas"
            className={`canvas ${elements.length === 0 ? 'empty' : ''}`}
            onClick={() => setSelectedId(null)}
          >
            {elements.length === 0 && (
              <p className="empty-text">Select an element from top to start designing</p>
            )}

            {elements.map(element => (
              <div
                key={element.id}
                className={`canvas-element ${selectedId === element.id ? 'selected' : ''}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  backgroundColor: element.backgroundColor,
                  color: element.textColor,
                  width: element.width !== 'auto' ? `${element.width}px` : 'auto',
                  height: element.height !== 'auto' ? `${element.height}px` : 'auto',
                  borderRadius: `${element.borderRadius}px`,
                  fontSize: `${element.fontSize}px`,
                  padding: element.type === 'button' ? '8px 16px' : element.type === 'text' ? '4px 8px' : '0',
                  display: element.type === 'div' ? 'flex' : 'block',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: element.type === 'div' ? '1px dashed #ccc' : 'none'
                }}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedId(element.id)
                }}
              >
                {element.text}
              </div>
            ))}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="properties-panel">
          <h2 className="panel-title">Properties</h2>
          {selectedElement ? (
            <div>
              <div className="info-pill">
                <strong>Type:</strong> {selectedElement.type.toUpperCase()}
              </div>

              {(selectedElement.type === 'button' || selectedElement.type === 'text' || selectedElement.type === 'div') && (
                <div className="property-group">
                  <label className="label">Text Content</label>
                  <input
                    type="text"
                    className="input-text"
                    value={selectedElement.text}
                    onChange={(e) => handlePropertyChange(selectedElement.id, 'text', e.target.value)}
                  />
                </div>
              )}

              <div className="property-group-row">
                <div className="property-group">
                  <label className="label">Width (px)</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="auto or 100"
                    value={selectedElement.width}
                    onChange={(e) => handlePropertyChange(selectedElement.id, 'width', e.target.value)}
                  />
                </div>
                <div className="property-group">
                  <label className="label">Height (px)</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="auto or 100"
                    value={selectedElement.height}
                    onChange={(e) => handlePropertyChange(selectedElement.id, 'height', e.target.value)}
                  />
                </div>
              </div>

              <div className="property-group-row">
                 <div className="property-group">
                  <label className="label">Border Radius</label>
                  <input
                    type="number"
                    className="input-text"
                    value={selectedElement.borderRadius}
                    onChange={(e) => handlePropertyChange(selectedElement.id, 'borderRadius', e.target.value)}
                  />
                </div>
                <div className="property-group">
                  <label className="label">Font Size</label>
                  <input
                    type="number"
                    className="input-text"
                    value={selectedElement.fontSize}
                    onChange={(e) => handlePropertyChange(selectedElement.id, 'fontSize', e.target.value)}
                  />
                </div>
              </div>

              <div className="property-group">
                <label className="label">Background Color</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    className="input-color"
                    value={selectedElement.backgroundColor !== 'transparent' ? selectedElement.backgroundColor : '#ffffff'}
                    onChange={(e) => handlePropertyChange(selectedElement.id, 'backgroundColor', e.target.value)}
                  />
                  <span className="color-hex">{selectedElement.backgroundColor}</span>
                </div>
              </div>

              <div className="property-group">
                <label className="label">Text Color</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    className="input-color"
                    value={selectedElement.textColor}
                    onChange={(e) => handlePropertyChange(selectedElement.id, 'textColor', e.target.value)}
                  />
                  <span className="color-hex">{selectedElement.textColor}</span>
                </div>
              </div>

              <button
                className="delete-btn"
                onClick={() => handleDeleteElement(selectedElement.id)}
              >
                Delete Element
              </button>

              <div className="code-section">
                <label className="label">React Code</label>
                <div className="code-block">
                  {generateElementCode(selectedElement)}
                </div>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(generateElementCode(selectedElement))
                    // Could add a toast notification here
                  }}
                >
                  Copy Code
                </button>
              </div>
            </div>
          ) : (
            <p className="no-selection">Click any element on the canvas to inspect and edit its properties.</p>
          )}
        </div>
      </div>
    </div>
  )
}
