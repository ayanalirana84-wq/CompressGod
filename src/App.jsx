import React, { useState } from "react";
import { zipSync, unzipSync } from "fflate";
import { motion } from "framer-motion";

export default function App() {
  const [files, setFiles] = useState([]);
  const [zipping, setZipping] = useState(false);
  const [unzipping, setUnzipping] = useState(false);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || e.dataTransfer.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e);
  };

  const compressFiles = async () => {
    if (files.length === 0) return;
    setZipping(true);

    const entries = await Promise.all(
      files.map((file) =>
        file.arrayBuffer().then((buf) => [file.name, new Uint8Array(buf)])
      )
    );

    const zipObj = {};
    entries.forEach(([name, buf]) => (zipObj[name] = buf));
    const zipped = zipSync(zipObj);
    downloadBlob(new Blob([zipped], { type: "application/zip" }), "compressed.zip");

    setZipping(false);
  };

  const extractZip = async (file) => {
    setUnzipping(true);
    const buf = new Uint8Array(await file.arrayBuffer());
    const unzipped = unzipSync(buf);

    Object.entries(unzipped).forEach(([name, content]) => {
      downloadBlob(new Blob([content]), name);
    });

    setUnzipping(false);
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Hero Section */}
      <motion.div
        className="flex flex-col items-center mt-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="/logo.png"
          alt="CompressGod Logo"
          className="w-24 h-24 mb-4 drop-shadow-lg"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
          CompressGod
        </h1>
        <p className="text-gray-400 mt-2 text-lg text-center">V1.5.3 – Fast, Secure & Private File Compression</p>
      </motion.div>

      {/* Upload Box */}
      <motion.div
        className="mt-12 border-2 border-gray-700 rounded-2xl p-10 w-11/12 md:w-2/3 lg:w-1/2 text-center cursor-pointer backdrop-blur-md bg-white/5 shadow-xl hover:shadow-purple-500/30 transition"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput").click()}
        whileHover={{ scale: 1.02 }}
      >
        <p className="font-semibold text-xl">🚀 Drag & Drop files here</p>
        <p className="text-sm text-gray-400">or tap to browse</p>
        <input type="file" id="fileInput" multiple className="hidden" onChange={handleFiles} />
      </motion.div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-8 w-11/12 md:w-2/3 lg:w-1/2">
          <h2 className="text-lg font-bold mb-3">Selected Files</h2>
          <ul className="bg-gray-800/60 p-4 rounded-lg max-h-40 overflow-y-auto shadow-inner backdrop-blur-md">
            {files.map((file, i) => (
              <li key={i} className="text-sm border-b border-gray-700 py-2 flex justify-between">
                {file.name}
                <button
                  className="text-blue-400 hover:underline ml-4"
                  onClick={() => (file.name.endsWith(".zip") ? extractZip(file) : null)}
                >
                  {file.name.endsWith(".zip") ? "Extract" : ""}
                </button>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={compressFiles}
              disabled={zipping}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 px-6 py-3 rounded-lg font-semibold shadow-lg disabled:opacity-50"
            >
              {zipping ? "⏳ Compressing..." : "📦 Download ZIP"}
            </button>
            <button
              onClick={() => setFiles([])}
              className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold shadow-md"
            >
              ❌ Clear
            </button>
          </div>
        </div>
      )}

      {unzipping && <p className="mt-4 text-yellow-400">🔓 Extracting ZIP...</p>}

      {/* Footer */}
      <footer className="w-full mt-16 bg-gray-900/60 py-6 text-center backdrop-blur-md border-t border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">About CompressGod</h2>
        <p className="mb-1">Created by <span className="text-blue-400">Ayan Ali</span></p>
        <p className="mb-2">Contact: <a href="mailto:ayanalirana84@gmail.com" className="text-purple-400 underline">ayanalirana84@gmail.com</a></p>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} CompressGod – All rights reserved.</p>
      </footer>
    </div>
  );
}
