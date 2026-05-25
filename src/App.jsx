import { useState, useEffect } from 'react'

export default function App() {
  const [elements, setElements] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // History State for Undo/Redo
  const [history, setHistory] = useState([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Modal and editing states
  const [showExportModal, setShowExportModal] = useState(false)
  const [copiedFeedback, setCopiedFeedback] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Helper to commit changes to history stack and save to localStorage
  const setElementsWithHistory = (newElements, shouldPush = true) => {
    setElements(newElements)
    if (shouldPush) {
      const nextHistory = history.slice(0, historyIndex + 1)
      setHistory([...nextHistory, newElements])
      setHistoryIndex(nextHistory.length)
    }
  }

  // LocalStorage - Load on Mount
  useEffect(() => {
    const saved = localStorage.getItem('dnd-elements')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setElements(parsed)
        setHistory([parsed])
        setHistoryIndex(0)
      } catch (e) {
        console.error("Failed to load elements from localStorage", e)
      }
    }
  }, [])

  // LocalStorage - Save on Elements Change
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem('dnd-elements', JSON.stringify(elements))
    } else {
      localStorage.removeItem('dnd-elements')
    }
  }, [elements])

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      setHistoryIndex(prevIndex)
      setElements(history[prevIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      setElements(history[nextIndex])
    }
  }

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [history, historyIndex, elements])

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
    const newElements = [...elements, newElement]
    setElementsWithHistory(newElements)
    setSelectedId(newElement.id)
  }

  // Handle generic property changes
  const handlePropertyChange = (id, property, value, pushHistory = true) => {
    const newElements = elements.map(el =>
      el.id === id ? { ...el, [property]: value } : el
    )
    setElementsWithHistory(newElements, pushHistory)
  }

  const handleDeleteElement = (id) => {
    const newElements = elements.filter(el => el.id !== id)
    setElementsWithHistory(newElements)
    setSelectedId(null)
  }

  const handleClearCanvas = () => {
    if (window.confirm("Are you sure you want to clear the canvas? All elements will be deleted.")) {
      setElementsWithHistory([])
      setSelectedId(null)
    }
  }

  // Drag start
  const handleMouseDown = (e, id) => {
    if (editingId === id) return // Don't drag while editing text inline
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
    if (draggingId !== null) {
      setElementsWithHistory(elements)
    }
    setDraggingId(null)
  }

  const selectedElement = elements.find(el => el.id === selectedId)

  // Generate code for selected element
  const generateElementCode = (element) => {
    const commonStyles = `  position: 'absolute',
  left: '${element.x}px',
  top: '${element.y}px',
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
      return `<span style={{\n${commonStyles}  padding: '4px 8px'\n}}>\n  ${element.text}\n</span>`
    } else if (element.type === 'div') {
      return `<div style={{\n${commonStyles}  display: 'flex',\n  alignItems: 'center',\n  justifyContent: 'center',\n  border: '1px dashed #ccc'\n}}>\n  ${element.text}\n</div>`
    }
    return ''
  }

  // Generate complete layout code for all elements on the canvas
  const generateFullCanvasCode = () => {
    const elementsCode = elements.map(el => {
      const commonStyles = `    position: 'absolute',
    left: '${el.x}px',
    top: '${el.y}px',
    backgroundColor: '${el.backgroundColor}',
    color: '${el.textColor}',
    width: '${el.width === 'auto' ? 'auto' : el.width + 'px'}',
    height: '${el.height === 'auto' ? 'auto' : el.height + 'px'}',
    borderRadius: '${el.borderRadius}px',
    fontSize: '${el.fontSize}px',
    boxSizing: 'border-box',`

      if (el.type === 'button') {
        return `      <button style={{\n${commonStyles}\n        padding: '8px 16px',\n        border: 'none',\n        cursor: 'pointer'\n      }}>\n        ${el.text}\n      </button>`
      } else if (el.type === 'text') {
        return `      <span style={{\n${commonStyles}\n        padding: '4px 8px'\n      }}>\n        ${el.text}\n      </span>`
      } else if (el.type === 'div') {
        return `      <div style={{\n${commonStyles}\n        display: 'flex',\n        alignItems: 'center',\n        justifyContent: 'center',\n        border: '1px dashed #ccc'\n      }}>\n        ${el.text}\n      </div>`
      }
      return ''
    }).join('\n\n')

    return `import React from 'react';

export default function MyCustomLayout() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '600px',
      position: 'relative',
      backgroundColor: '#2a2a2a', // Canvas background color
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
${elementsCode || '      {/* No elements added yet. Add elements to your layout. */}'}
    </div>
  );
}`
  }

  return (
    <div className="app-container" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Toolbar */}
      <div className="toolbar">
        <h1 className="toolbar-title">UI Builder Pro</h1>
        <div className="button-group">
          {/* Component Spawners */}
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

          <span className="toolbar-separator"></span>

          {/* History Controls */}
          <button
            className="toolbar-button"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            title="Undo last action (Ctrl+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
            Undo
          </button>
          <button
            className="toolbar-button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo action (Ctrl+Y)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
            Redo
          </button>

          <span className="toolbar-separator"></span>

          {/* Layout Utilities */}
          <button className="toolbar-button export-btn" onClick={() => setShowExportModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Export Full Layout
          </button>
          <button className="toolbar-button clear-btn" onClick={handleClearCanvas}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Clear
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Canvas */}
        <div className="canvas-wrapper">
          <div
            id="canvas"
            className={`canvas ${elements.length === 0 ? 'empty' : ''}`}
            onClick={() => {
              setSelectedId(null)
              setEditingId(null)
            }}
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
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  setEditingId(element.id)
                  setSelectedId(element.id)
                }}
              >
                {editingId === element.id ? (
                  <input
                    type="text"
                    className="inline-edit-input"
                    value={element.text}
                    onChange={(e) => handlePropertyChange(element.id, 'text', e.target.value, false)}
                    onBlur={() => {
                      setEditingId(null)
                      // Commit text change to history on blur
                      setElementsWithHistory(elements)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingId(null)
                        setElementsWithHistory(elements)
                      }
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  element.text
                )}
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
                <label className="label">React Code (Single Element)</label>
                <div className="code-block">
                  {generateElementCode(selectedElement)}
                </div>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(generateElementCode(selectedElement))
                  }}
                >
                  Copy Element Code
                </button>
              </div>
            </div>
          ) : (
            <p className="no-selection">Click any element on the canvas to inspect and edit its properties.</p>
          )}
        </div>
      </div>

      {/* Export Full Code Modal */}
      {showExportModal && (
        <div className="modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="modal-content-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Export React Component</h2>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Copy this fully compiled React component to render your layout exactly as designed.
              </p>
              <div className="code-block full-code-block">
                {generateFullCanvasCode()}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="copy-btn modal-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(generateFullCanvasCode())
                  setCopiedFeedback(true)
                  setTimeout(() => setCopiedFeedback(false), 2000)
                }}
              >
                {copiedFeedback ? "✓ Copied to Clipboard!" : "Copy Full Layout Code"}
              </button>
              <button className="close-btn" onClick={() => setShowExportModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
