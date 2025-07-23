import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProblem } from "../api/problemApi";
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const boilerplate = {
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!");\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  python: 'print("Hello, World!")',
  javascript: 'console.log("Hello, World!");',
};

function ProblemDetailPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(boilerplate.cpp);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await getProblem(slug);
        setProblem(res.data.problem);
      } catch (err) {
        setError("Problem not found or an error occurred.");
        console.error("Failed to fetch problem:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  useEffect(() => {
    setCode(boilerplate[language]);
  }, [language]);

  const handleRun = async () => {
    setIsExecuting(true);
    setOutput(`Running ${language.toUpperCase()} code...`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setOutput(`Output:\nHello, World!`);
    setIsExecuting(false);
  };

  const handleSubmit = async () => {
    setIsExecuting(true);
    setOutput(`Submitting ${language.toUpperCase()} code...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOutput(`Result:\nAccepted`);
    setIsExecuting(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading problem...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="h-screen w-full">
      <PanelGroup direction="horizontal" className="h-full">
        {/* LEFT PANEL */}
        <Panel defaultSize={50} minSize={30}>
          <div className="p-6 overflow-y-auto h-full bg-white">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">{problem.name}</h1>
            <p className="text-gray-700 mt-4 whitespace-pre-wrap">{problem.statement}</p>
            {problem.samples?.map((sample, idx) => (
              <div key={idx} className="mt-4 bg-gray-100 p-3 rounded">
                <p><strong>Input:</strong> {sample.input}</p>
                <p><strong>Output:</strong> {sample.output}</p>
              </div>
            ))}
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-indigo-100 transition-colors" />

        {/* RIGHT PANEL */}
        <Panel defaultSize={50} minSize={30}>
          <div className="bg-gray-50 h-full flex flex-col">
            {/* Header with dropdown and buttons */}
            <div className="flex items-center justify-between p-3 bg-white border-b">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border rounded-md p-2 text-sm text-gray-800"
              >
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>

              <div className="space-x-3">
                <button
                  onClick={handleRun}
                  disabled={isExecuting}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                >
                  {isExecuting ? "Running..." : "Run"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isExecuting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                >
                  {isExecuting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            {/* Vertical split for editor and output */}
            <PanelGroup direction="vertical" className="flex-grow">
              <Panel defaultSize={70}>
                <Editor
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value)}
                  className="h-full"
                />
              </Panel>
              <PanelResizeHandle className="h-2 bg-gray-200 hover:bg-indigo-100 transition-colors" />
              <Panel defaultSize={30}>
                <div className="bg-white border-t h-full overflow-auto p-3">
                  <h3 className="font-semibold text-gray-800 mb-1">Output:</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{output}</pre>
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default ProblemDetailPage;
