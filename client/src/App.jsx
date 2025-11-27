import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ArcGISMap from "./components/ArcGISMap";
import DocumentMap from "./pages/DocumentMap";

function App() {
  const [docs, setDocs] = useState([]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + "/api/documents"
      );
      const data = await response.json();
      setDocs(data);
    } catch (error) {
      console.error("Documents error:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Navbar */}
        <header className="bg-blue-600 text-white p-4">
          <nav className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-lg font-semibold">
              Test App
            </Link>

            <div className="flex gap-4">
              <button
                onClick={fetchDocuments}
                className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Database Test
              </button>

              <Link
                to="/second"
                className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Document Map
              </Link>
            </div>
          </nav>
        </header>

        {/* Router content */}
        <main className="container mx-auto flex-grow p-4">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <h2 className="text-xl font-bold mb-4">List of documents:</h2>
                  <ul className="list-disc list-inside bg-white p-4 rounded shadow">
                    {docs.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.url}
                          className="text-yellow-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {doc.title}
                        </a>
                      </li>
                    ))}
                    {docs.length === 0 && <li>There are no documents.</li>}
                  </ul>

                  <div className="p-4">
                    <h1 className="text-xl mb-4">ArcGISMap</h1>

                    <div className="h-[600px]">
                      <ArcGISMap />
                    </div>
                  </div>
                </>
              }
            />

            <Route path="/second" element={<DocumentMap />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
