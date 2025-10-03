import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { Web3Provider } from "./contexts/Web3Context"
import Header from "./components/Header"
import HomePage from "./pages/HomePage"
import AdminPage from "./pages/AdminPage"
import "react-toastify/dist/ReactToastify.css"
import "./App.css"

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </Web3Provider>
  )
}

export default App
