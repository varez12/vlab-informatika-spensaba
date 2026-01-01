import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Excel from './pages/Excel';
import App2 from './pages/Blockly'; // Game Component
import MailMerger from './pages/MailMerger';
import WordParagraph from './pages/WordParagraph';
import WordPageLayout from './pages/WordPageLayout';
import WordTabulator from './pages/WordTabulator'; // Fixed Import
import Blockly from './pages/Blockly';
import ExcelChart from "./pages/ExcelChart"; // Import new page

function App() {
  return (
    <Router>
      {/* Navbar muncul di atas semua halaman */}
      <Navbar />

      {/* Konten di bawah ini akan berubah sesuai URL */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/excel" element={<Excel />} />
        <Route path="/excel-chart" element={<ExcelChart />} /> {/* New Route */}
        <Route path="/game" element={<Blockly />} />
        <Route path="/mailmerge" element={<MailMerger />} />
        <Route path="/word-paragraph" element={<WordParagraph />} />
        <Route path="/word-layout" element={<WordPageLayout />} />
        <Route path="/word-tabulator" element={<WordTabulator />} />
      </Routes>
    </Router>
  );
}

export default App;
