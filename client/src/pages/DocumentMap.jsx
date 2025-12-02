// src/pages/DocumentMap.jsx
import { useState } from "react";
import DocumentMapView from "../components/DocumentMapView";

export default function DocumentMap() {
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [hoveredObjectId, setHoveredObjectId] = useState(null);
  const [activeObjectId, setActiveObjectId] = useState(null);

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)] p-4">
      {/* Map area */}
      <div className="flex-1 min-h-0">
        <DocumentMapView
          onSheetsSelected={(sheets) => {
            setSelectedSheets(sheets);
            setActiveObjectId(null);
            setHoveredObjectId(null);
          }}
          hoveredObjectId={hoveredObjectId}
          activeObjectId={activeObjectId}
        />
      </div>

      {/* Right panel */}
      <div className="w-96 bg-white rounded shadow p-4 overflow-auto">
        <h2 className="text-lg font-semibold mb-2">Selected historic maps</h2>

        {selectedSheets.length === 0 && (
          <p className="text-sm text-gray-500">
            Click on a footprint / green point on the map to see available
            sheets.
          </p>
        )}

        <ul className="space-y-4">
          {selectedSheets.map((sheet) => {
            const isHovered = hoveredObjectId === sheet.objectId;
            const isActive = activeObjectId === sheet.objectId;

            const cardClasses = `border rounded p-2 cursor-pointer transition-colors ${
              isActive
                ? "bg-blue-100 border-blue-500"
                : isHovered
                ? "bg-gray-100 border-gray-400"
                : "bg-white border-gray-200"
            }`;

            // грузим PNG только для активной карты
            const showPreview = isActive;

            return (
              <li
                key={sheet.id}
                className={cardClasses}
                onMouseEnter={() => {
                  if (sheet.objectId != null) {
                    setHoveredObjectId(sheet.objectId);
                  }
                }}
                onMouseLeave={() => setHoveredObjectId(null)}
                onClick={() => {
                  if (sheet.objectId == null) return;
                  // клик по активной карточке выключает её
                  setActiveObjectId((prev) =>
                    prev === sheet.objectId ? null : sheet.objectId
                  );
                }}
              >
                <div className="font-medium mb-1">
                  {sheet.title || `Sheet ${sheet.id}`}
                </div>

                {sheet.signature && (
                  <div className="text-xs text-gray-600 mb-1">
                    Signature: {sheet.signature}
                  </div>
                )}

                {sheet.imageUrl ? (
                  <>
                    {showPreview ? (
                      <>
                        <img
                          src={sheet.imageUrl}
                          alt={
                            sheet.title || sheet.signature || "historic map"
                          }
                          loading="lazy"
                          className="w-full rounded border object-contain max-h-64"
                        />
                        <a
                          href={sheet.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-xs text-blue-600 underline inline-block"
                          onClick={(e) => e.stopPropagation()} // не менять активную при открытии в новой вкладке
                        >
                          Open full image
                        </a>
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-blue-600">
                        Click card to load preview
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-500">
                    No image URL could be constructed.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
