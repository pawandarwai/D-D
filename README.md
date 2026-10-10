# Drag & Drop UI Builder

A simple React-based drag-and-drop UI builder that allows users to create layouts by adding and positioning elements on a canvas.

## Features & Application

✨ **Easy Element Creation**
- Add buttons, text, or container divs to the canvas with one click

🎯 **Intuitive Dragging**
- Drag elements around the canvas to position them exactly where you want
- Elements stay within canvas bounds

🎨 **Element Customizations**
- Edit text for buttons and text elements
- Change background color for any element
- View element position information

🔄 **Real-time State Management**
- All elements stored in React state.
- Dynamic rendering from state changes

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## How to Use

1. **Add Elements**: Click one of the buttons in the toolbar to add a Button, Text, or Container to the canvas
2. **Move Elements**: Click and drag any element on the canvas to reposition it
3. **Edit Properties**: Click an element to select it, then use the Properties panel on the right to:
   - Change text (for buttons and text elements)
   - Change background color using the color picker
4. **Delete Elements**: Select an element and click "Delete Element" in the Properties panel

## Project structure

```
src/
├── App.jsx          # Main application component
├── main.jsx         # React entry point
└── index.css        # Global styles
```

## Technologies Used

- **React 18** - UI library with hooks
- **Vite** - Build tool and dev server
- **CSS-in-JS** - Inline styles for simplicity

## Notes

- The application uses only basic React hooks (useState) - no complex state management libraries
- All styling is done with inline CSS for simplicity
- The entire application logic is contained in a single `App.jsx` file for beginner-friendliness

## License

MIT
