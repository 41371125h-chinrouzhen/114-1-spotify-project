// --- /client/src/main.jsx ---

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css' // 修正：加入這行，並指向 styles 資料夾

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)