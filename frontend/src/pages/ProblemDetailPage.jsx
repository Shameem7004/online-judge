import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProblem } from "../api/problemApi";
import { runCode } from "../api/compilerApi";
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AuthContext } from "../context/AuthContext";

const boilerplate = {
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!");\n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    python: 'print("Hello, World!")',
    javascript: 'console.log("Hello, World!");',
};

function ProblemDetailPage() {
    const { slug } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState(boilerplate.cpp);
    const [output, setOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);

    // Custom input state
    const [showInputBox, setShowInputBox] = useState(false);
    const [customInput, setCustomInput] = useState("");
    const [needsCustomInput, setNeedsCustomInput] = useState(false);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await getProblem(slug);
                setProblem(res.data.problem);
            } catch (err) {
                setError("Problem not found or an error occurred.");
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [slug]);

    useEffect(() => {
        setCode(boilerplate[language]);
    }, [language]);

    // Step 1: Show input box only if needed
    const handleRun = () => {
        setOutput(""); // Clear previous output
        setCustomInput(""); // Clear previous input
        // Check if code contains input-related functions
        const inputPatterns = {
            cpp: /\bcin\b|std::cin|scanf/,
            c: /scanf|getchar|fgets/,
            java: /Scanner|System\.console\(\)|BufferedReader|readLine/,
            python: /input\(|raw_input/,
            javascript: /prompt\(|readline|process\.stdin/
        };

        const pattern = inputPatterns[language];
        if (pattern && pattern.test(code)) {
            setNeedsCustomInput(true);
            setShowInputBox(true);
        } else {
            setNeedsCustomInput(false);
            setShowInputBox(false);
            handleRunWithInput("");
        }
    };

    // Step 2: Send code + input to backend
    const handleRunWithInput = async (inputValue) => {
        setIsExecuting(true);
        setOutput("Running code...");
        try {
            const res = await runCode(language, code, inputValue);
            setOutput(`Output:\n${res.data.output}`);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message;
            setOutput(`Error:\n${errorMessage}`);
        }
        setIsExecuting(false);
        setShowInputBox(false);
    };

    const handleSubmit = async () => {
        if (!user) {
            alert("Please log in to submit your solution.");
            navigate('/login');
            return;
        }
        setIsExecuting(true);
        setOutput("Submitting code...");
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setOutput(`Result:\nAccepted (Simulation)`);
        } catch (err) {}
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
                            <div className="h-[1px] bg-gray-700" />
                            <Panel defaultSize={30}>
                                <div className="bg-[#1e1e1e] h-full overflow-auto font-mono">
                                    <div className="border-b border-gray-700 p-2">
                                        <span className="text-gray-400 text-sm">Input</span>
                                    </div>
                                    <div className="p-3">
                                        {/* Terminal Output */}
                                        <pre className="text-sm text-white whitespace-pre-wrap">{output}</pre>
                                        
                                        {/* Interactive Input Line */}
                                        {showInputBox && needsCustomInput && (
                                            <div className="mt-2 flex items-center border-l-2 border-indigo-500 pl-2">
                                                <span className="text-indigo-400 mr-2">›</span>
                                                <input
                                                    type="text"
                                                    value={customInput}
                                                    onChange={e => setCustomInput(e.target.value)}
                                                    onKeyPress={e => {
                                                        if (e.key === 'Enter' && !isExecuting) {
                                                            handleRunWithInput(customInput);
                                                        }
                                                    }}
                                                    className="flex-1 bg-transparent text-white text-sm outline-none"
                                                    placeholder="Enter input and press Enter..."
                                                    disabled={isExecuting}
                                                />
                                            </div>
                                        )}
                                    </div>
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