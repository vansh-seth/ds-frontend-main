import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upload from "./Pages/Upload";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Upload />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
