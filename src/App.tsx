import { AppRouter } from "@/config/routes/app-router";
import { BrowserRouter as Router } from 'react-router-dom'

const basename = import.meta.env.VITE_BASENAME || ''

function App() {
    return (
        <Router basename={basename}>
            <AppRouter />
        </Router>
    )
}

export default App
