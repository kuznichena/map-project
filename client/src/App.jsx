import { useState } from "react";
import ArcGISMap from "./components/ArcGISMap";

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-blue-600 text-white p-4">
        <nav className="container mx-auto flex justify-between">
          <h1 className="text-lg font-semibold">Mini Test App</h1>
          <button
            onClick={fetchDocuments}
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Show the list of documents
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="container mx-auto flex-grow p-4">
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

        <div className="p-4 flex-grow flex flex-col">
          <h1 className="text-xl mb-4">ArcGISMap</h1>

          <div className="flex-grow h-0">
            <ArcGISMap />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
