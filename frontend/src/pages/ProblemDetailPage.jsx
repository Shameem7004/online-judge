import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useAuth } from '../context/AuthContext';
import { getProblemBySlug } from '../api/problemApi';
import { runCode } from '../api/compilerApi';
import { initiateSubmission } from '../api/submissionApi';
import AIFeedbackModal from '../components/AIFeedbackModal';
import { getTestcasesByProblem } from '../api/testcaseApi';

const BOILERPLATE = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
  python: '# Your code here\n',
  javascript: '// Your code here\n',
};

const SubmissionProgress = ({ progress, status, isJudging }) => {
  const getVerdictStyles = (verdict) => {
    switch (verdict) {
      case 'Accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Wrong Answer':
      case 'Runtime Error':
      case 'Time Limit Exceeded':
      case 'Error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      {/* Final Verdict Banner */}
      {!isJudging && progress.verdict && (
        <div className={`p-4 rounded-lg border mb-4 ${getVerdictStyles(progress.verdict)}`}>
          <h4 className="text-xl font-bold">
            {progress.verdict}
          </h4>
        </div>
      )}

      {/* Judging Status */}
      {isJudging && (
        <div className="mb-4 text-blue-300">
          <p>{status || 'Initializing...'}</p>
        </div>
      )}

      {/* Test Cases Grid */}
      <div className="bg-slate-800 p-3 rounded-md">
        <h5 className="text-sm font-medium text-slate-300 mb-3">Test Cases</h5>
        {progress.results.length === 0 && isJudging && (
          <p className="text-sm text-slate-400">Waiting for results...</p>
        )}
        <div className="flex flex-wrap gap-2">
          {progress.results.map((result, i) => (
            <div
              key={i}
              title={`Test Case ${i + 1}${result.passed ? '' : ' - Failed'}`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                result.passed
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
              style={{ animation: 'fadeIn 0.3s ease-out' }}
            >
              <span>{i + 1}</span>
              <span>{result.passed ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add style for animation
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

function ProblemDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const eventSourceRef = useRef(null);

  // State
  const [problem, setProblem] = useState(null);
  const [sampleTestcases, setSampleTestcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(BOILERPLATE.cpp);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [submissionProgress, setSubmissionProgress] = useState(null);
  const [judgingStatus, setJudgingStatus] = useState("");
  const [isJudging, setIsJudging] = useState(false);
  const [copiedState, setCopiedState] = useState({ type: null, index: null });
  
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [mobileActiveTab, setMobileActiveTab] = useState('problem');

  const [showAIModal, setShowAIModal] = useState(false);
  const [completedSubmissionId, setCompletedSubmissionId] = useState(null);
  const [isSubmissionJudged, setIsSubmissionJudged] = useState(false);

  function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Reset AI button when code or language changes
  useEffect(() => {
    setIsSubmissionJudged(false);
    setCompletedSubmissionId(null);
  }, [code, language]);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await getProblemBySlug(slug);
        setProblem(res.data.problem);
        
        const samples = res.data.problem.samples || [];
        setSampleTestcases(samples);

      } catch (err) {
        setError('Failed to load the problem. It may not exist.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  useEffect(() => {
    setCode(BOILERPLATE[language]);
  }, [language]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleCopy = (text, type, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState({ type, index });
      setTimeout(() => setCopiedState({ type: null, index: null }), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  // Add this function to process Java code and add missing imports
  const processJavaCode = (javaCode) => {
    if (language !== 'java') {
      return javaCode;
    }

    const requiredImports = {
      'Scanner': 'import java.util.Scanner;',
      'List': 'import java.util.List;',
      'ArrayList': 'import java.util.ArrayList;',
      'Map': 'import java.util.Map;',
      'HashMap': 'import java.util.HashMap;',
      'Set': 'import java.util.Set;',
      'HashSet': 'import java.util.HashSet;',
    };

    let importsToAdd = new Set();
    for (const className in requiredImports) {
      // Check if the class is used and not already imported
      if (javaCode.includes(className) && !javaCode.includes(requiredImports[className])) {
        importsToAdd.add(requiredImports[className]);
      }
    }

    if (importsToAdd.size > 0) {
      return [...importsToAdd].join('\n') + '\n\n' + javaCode;
    }

    return javaCode;
  };

  const handleRun = async () => {
    setIsExecuting(true);
    setOutput('');
    setError(null);
    try {
      // Process Java code to add missing imports
      const codeToRun = processJavaCode(code);
      console.log("Sending to compiler:", { code: codeToRun, language, input: customInput });

      const result = await runCode({ code: codeToRun, language, input: customInput });
      if (result.success) {
        setOutput(result.output);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError(err.message || 'Failed to run code.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAIFeedbackSubmit = async (feedback) => {
    if (!completedSubmissionId) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/submissions/${completedSubmissionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ feedback })
      });

      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again later.');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to submit your code.');
      navigate('/login');
      return;
    }
    
    if (deviceType === 'mobile') {
      setMobileActiveTab('editor');
    }
    
    setIsSubmissionJudged(false);
    setCompletedSubmissionId(null);
    
    setIsJudging(true);
    setIsExecuting(true);
    setOutput(""); 
    setSubmissionProgress({
      results: [],
      verdict: 'Judging...'
    });
    setJudgingStatus('Submitting...');

    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Process Java code to add missing imports for submission too
      const codeToSubmit = processJavaCode(code);

      const response = await initiateSubmission({
        problemId: problem._id,
        code: codeToSubmit,
        language,
      });

      const submissionId = response.data.submissionId;
      setCompletedSubmissionId(submissionId);
      
      const streamUrl = `${import.meta.env.VITE_API_URL}/submissions/stream/${submissionId}`;
      const eventSource = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setJudgingStatus('Connected to judge...');
      };

      eventSource.addEventListener('progress', (event) => {
        const data = JSON.parse(event.data);
        setJudgingStatus(data.status || 'Processing...');
      });

      eventSource.addEventListener('testcase', (event) => {
        const testCaseResult = JSON.parse(event.data);
        setSubmissionProgress(prev => ({
          ...prev,
          results: [...prev.results, testCaseResult]
        }));
      });

      eventSource.addEventListener('done', (event) => {
        const finalData = JSON.parse(event.data);
        setSubmissionProgress(prev => ({
          ...prev,
          verdict: finalData.verdict
        }));
        setIsJudging(false);
        setIsExecuting(false);
        setJudgingStatus('');
        eventSource.close();
        
        setIsSubmissionJudged(true);
      });

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        if (submissionProgress?.results?.length > 0) {
          const allPassed = submissionProgress.results.every(result => result.passed);
          setSubmissionProgress(prev => ({ ...prev, verdict: allPassed ? 'Accepted' : 'Wrong Answer' }));
        } else {
          setJudgingStatus('Connection error - check submission history');
        }
        setIsJudging(false);
        setIsExecuting(false);
        eventSource.close();
      };
    } catch (error) {
      console.error('Submission failed', error);
      setOutput(`Submission Failed:\n${error.response?.data?.message || error.message}`);
      setIsJudging(false);
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    if (problem?._id) {
      getTestcasesByProblem(problem._id).then(res => {
        setSampleTestcases(res.data.testcases.filter(tc => tc.isSample));
      });
    }
  }, [problem]);

  if (loading) return <div className="flex justify-center items-center h-screen text-slate-900">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-rose-600">{error}</div>;

  // MOBILE LAYOUT (0-767px)
  if (deviceType === 'mobile') {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex flex-col min-h-0 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex bg-white border-b border-slate-300 flex-shrink-0">
          <button
            onClick={() => setMobileActiveTab('problem')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              mobileActiveTab === 'problem' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600'
            }`}
          >
            Problem
          </button>
          <button
            onClick={() => setMobileActiveTab('editor')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              mobileActiveTab === 'editor' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600'
            }`}
          >
            Editor
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {/* Problem Tab */}
          {mobileActiveTab === 'problem' && (
            <div className="h-full overflow-y-auto bg-white p-4">
              <h1 className="text-2xl font-bold mb-3 text-slate-900">{problem.name}</h1>
              <div className="mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                  problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-800">Problem Statement</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{problem.statement}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-800">Input Format</h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{problem.inputFormat}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-800">Output Format</h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{problem.outputFormat}</p>
                </div>
                {sampleTestcases.map((sample, index) => (
                  <div key={sample._id || index}>
                    <h4 className="font-semibold text-slate-800 mb-2">Sample {index + 1}</h4>
                    <div className="bg-slate-100 p-4 rounded-md font-mono text-sm">
                      <p className="font-semibold text-slate-700">Input:</p>
                      <pre className="whitespace-pre-wrap bg-white p-2 rounded mt-1">
                        <code className="text-slate-900">{sample.displayInput || sample.input}</code>
                      </pre>
                      <p className="font-semibold mt-3 text-slate-700">Output:</p>
                      <pre className="whitespace-pre-wrap bg-white p-2 rounded mt-1">
                        <code className="text-slate-900">{sample.output}</code>
                      </pre>
                      {sample.explanation && (
                        <>
                          <p className="font-semibold mt-3 text-slate-700">Explanation:</p>
                          <p className="mt-1 text-slate-600">{sample.explanation}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor Tab */}
          {mobileActiveTab === 'editor' && (
            <div className="h-full flex flex-col min-h-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-3 bg-white border-b flex-shrink-0">
                <div>
                  <label htmlFor="language-select-mobile" className="sr-only">Programming Language</label>
                  <select
                    id="language-select-mobile"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-900"
                    disabled={isExecuting}
                  >
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <div className="space-x-2 flex items-center">
                  {isSubmissionJudged && (
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm cursor-pointer hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                    >
                      AI
                    </button>
                  )}
                  <button
                    onClick={handleRun}
                    disabled={isExecuting}
                    className="bg-slate-600 text-white px-3 py-1 rounded disabled:opacity-50 text-sm cursor-pointer hover:bg-slate-700 active:bg-slate-800 transition-colors"
                  >
                    {isExecuting && !isJudging ? "Running..." : "Run"}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isExecuting}
                    className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 text-sm cursor-pointer hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    {isJudging ? "Judging..." : "Submit"}
                  </button>
                </div>
              </div>

              {/* Resizable Editor and I/O sections */}
              <PanelGroup direction="vertical" className="flex-1 min-h-0 h-full">
                <Panel defaultSize={60} minSize={5}>
                  <div className="h-full min-h-0">
                    <Editor
                      height="100%"
                      language={language}
                      theme="vs-dark"
                      value={code}
                      onChange={setCode}
                      options={{ readOnly: isExecuting, fontSize: 14, minimap: { enabled: false } }}
                    />
                  </div>
                </Panel>

                <PanelResizeHandle className="h-2 bg-slate-700 hover:bg-slate-600 transition-colors" />

                <Panel defaultSize={40} minSize={5}>
                  <div className="h-full bg-slate-800 min-h-0">
                    <PanelGroup direction="horizontal" className="h-full min-h-0">
                      <Panel defaultSize={50} minSize={5}>
                        <div className="h-full flex flex-col min-h-0">
                          <div className="text-xs font-medium text-slate-300 px-2 py-2 bg-slate-700 border-b border-slate-600 flex-shrink-0">
                            <label htmlFor="custom-input-mobile">Input (stdin)</label>
                          </div>
                          <textarea
                            id="custom-input-mobile"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Enter input..."
                            className="flex-1 bg-[#1e1e1e] text-white font-mono resize-none border-none outline-none p-2 text-sm placeholder-slate-400"
                            disabled={isExecuting}
                          />
                        </div>
                      </Panel>

                      <PanelResizeHandle className="w-2 bg-slate-600 hover:bg-slate-500 transition-colors" />
                      
                      <Panel defaultSize={50} minSize={5}>
                        <div className="h-full flex flex-col min-h-0">
                          <div className="text-xs font-medium text-slate-300 px-2 py-2 bg-slate-700 border-b border-slate-600 flex-shrink-0">
                            Output
                          </div>
                          <div className="flex-1 bg-[#1e1e1e] overflow-auto">
                            {submissionProgress ? (
                              <div className="h-full overflow-y-auto">
                                <SubmissionProgress 
                                  progress={submissionProgress} 
                                  status={judgingStatus}
                                  isJudging={isJudging}
                                />
                              </div>
                            ) : (
                              <pre className="h-full w-full text-white font-mono whitespace-pre-wrap p-2 text-sm">
                                {output}
                              </pre>
                            )}
                          </div>
                        </div>
                      </Panel>
                    </PanelGroup>
                  </div>
                </Panel>
              </PanelGroup>
            </div>
          )}
        </div>

        {showAIModal && (
          <AIFeedbackModal
            submissionId={completedSubmissionId}
            onClose={() => setShowAIModal(false)}
          />
        )}
      </div>
    );
  }

  // TABLET LAYOUT (768-1023px)
  if (deviceType === 'tablet') {
    return (
      <div className="h-[calc(100vh-4rem)] w-full min-h-0 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full min-h-0">
          <Panel defaultSize={45} minSize={10}>
            <div className="p-4 overflow-y-auto h-full bg-white">
              <h1 className="text-2xl font-bold mb-3 text-slate-900">{problem.name}</h1>
              <div className="mb-3">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                  problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 text-slate-800">Problem Statement</h3>
                  <p className="whitespace-pre-wrap text-slate-700">{problem.statement}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-800">Input Format</h3>
                  <p className="whitespace-pre-wrap text-slate-700">{problem.inputFormat}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-800">Output Format</h3>
                  <p className="whitespace-pre-wrap text-slate-700">{problem.outputFormat}</p>
                </div>
                {sampleTestcases.map((sample, index) => (
                  <div key={sample._id || index}>
                    <h4 className="font-semibold text-slate-800 mb-2">Sample {index + 1}</h4>
                    <div className="bg-slate-100 p-4 rounded-md font-mono text-sm">
                      <p className="font-semibold text-slate-700">Input:</p>
                      <pre className="whitespace-pre-wrap bg-white p-2 rounded mt-1">
                        <code className="text-slate-900">{sample.displayInput || sample.input}</code>
                      </pre>
                      <p className="font-semibold mt-3 text-slate-700">Output:</p>
                      <pre className="whitespace-pre-wrap bg-white p-2 rounded mt-1">
                        <code className="text-slate-900">{sample.output}</code>
                      </pre>
                      {sample.explanation && (
                        <>
                          <p className="font-semibold mt-3 text-slate-700">Explanation:</p>
                          <p className="mt-1 text-slate-600">{sample.explanation}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-slate-200 hover:bg-slate-300" />

          <Panel defaultSize={55} minSize={10}>
            <div className="h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between p-3 bg-white border-b flex-shrink-0">
                <div>
                  <label htmlFor="language-select-tablet" className="sr-only">Programming Language</label>
                  <select
                    id="language-select-tablet"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border border-slate-300 rounded px-3 py-1 text-slate-900"
                    disabled={isExecuting}
                  >
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <div className="space-x-2 flex items-center">
                  {isSubmissionJudged && (
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="bg-indigo-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                    >
                      AI Feedback
                    </button>
                  )}
                  <button
                    onClick={handleRun}
                    disabled={isExecuting}
                    className="bg-slate-600 text-white px-3 py-2 rounded disabled:opacity-50 cursor-pointer hover:bg-slate-700 active:bg-slate-800 transition-colors"
                  >
                    {isExecuting && !isJudging ? "Running..." : "Run"}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isExecuting}
                    className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50 cursor-pointer hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    {isJudging ? "Judging..." : "Submit"}
                  </button>
                </div>
              </div>

              <PanelGroup direction="vertical" className="flex-1 min-h-0 h-full">
                <Panel defaultSize={65} minSize={5}>
                  <div className="h-full min-h-0">
                    <Editor
                      height="100%"
                      language={language}
                      theme="vs-dark"
                      value={code}
                      onChange={setCode}
                      options={{ readOnly: isExecuting }}
                    />
                  </div>
                </Panel>

                <PanelResizeHandle className="h-2 bg-slate-700 hover:bg-slate-600" />

                <Panel defaultSize={35} minSize={5}>
                  <div className="h-full flex bg-slate-800 min-h-0">
                    <div className="flex-1 flex flex-col border-r border-slate-600 min-h-0">
                      <div className="text-sm font-medium text-slate-300 px-3 py-2 bg-slate-700 border-b border-slate-600">
                        <label htmlFor="custom-input-tablet">Input (stdin)</label>
                      </div>
                      <textarea
                        id="custom-input-tablet"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter standard input for 'Run' here..."
                        className="flex-grow bg-[#1e1e1e] text-white font-mono resize-none border-none outline-none p-3 overflow-y-auto placeholder-slate-400"
                        disabled={isExecuting}
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="text-sm font-medium text-slate-300 px-3 py-2 bg-slate-700 border-b border-slate-600">
                        Output
                      </div>
                      <div className="flex-grow min-h-0 relative bg-[#1e1e1e] overflow-auto">
                        {submissionProgress ? (
                          <SubmissionProgress 
                            progress={submissionProgress} 
                            status={judgingStatus}
                            isJudging={isJudging}
                          />
                        ) : (
                          <pre className="h-full w-full text-white font-mono whitespace-pre-wrap p-3 text-sm">
                            {output}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </div>
          </Panel>
        </PanelGroup>

        {showAIModal && (
          <AIFeedbackModal
            submissionId={completedSubmissionId}
            onClose={() => setShowAIModal(false)}
          />
        )}
      </div>
    );
  }

  // DESKTOP LAYOUT (1024px+)
  return (
    <div className="h-[calc(100vh-4rem)] w-full min-h-0 overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full min-h-0">
        <Panel defaultSize={50} minSize={10}>
          <div className="p-6 overflow-y-auto h-full bg-white">
            <h1 className="text-3xl font-bold mb-4 text-slate-900">{problem.name}</h1>
            <div className="mb-4">
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-slate-800">Problem Statement</h3>
                <p className="whitespace-pre-wrap text-slate-700">{problem.statement}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-slate-800">Input Format</h3>
                <p className="whitespace-pre-wrap text-slate-700">{problem.inputFormat}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-slate-800">Output Format</h3>
                <p className="whitespace-pre-wrap text-slate-700">{problem.outputFormat}</p>
              </div>
              {sampleTestcases.map((sample, index) => (
                <div key={sample._id || index}>
                  <h4 className="font-semibold text-slate-800 mb-2">Sample {index + 1}</h4>
                  <div className="bg-slate-100 p-4 rounded-md font-mono text-sm">
                    <p className="font-semibold text-slate-700">Input:</p>
                    <pre className="whitespace-pre-wrap bg-white p-2 rounded mt-1">
                      <code className="text-slate-900">{sample.displayInput || sample.input}</code>
                    </pre>
                    <p className="font-semibold mt-3 text-slate-700">Output:</p>
                    <pre className="whitespace-pre-wrap bg-white p-2 rounded mt-1">
                      <code className="text-slate-900">{sample.output}</code>
                    </pre>
                    {sample.explanation && (
                      <>
                        <p className="font-semibold mt-3 text-slate-700">Explanation:</p>
                        <p className="mt-1 text-slate-600">{sample.explanation}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-slate-200 hover:bg-slate-300 transition-colors" />

        <Panel defaultSize={50} minSize={10}>
          <div className="h-full min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-white border-b flex-shrink-0">
              <div>
                <label htmlFor="language-select-desktop" className="sr-only">Programming Language</label>
                <select
                  id="language-select-desktop"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-slate-300 rounded px-3 py-1 text-slate-900"
                  disabled={isExecuting}
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              <div className="space-x-2 flex items-center">
                {isSubmissionJudged && (
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                  >
                    AI Feedback
                  </button>
                )}
                <button
                  onClick={handleRun}
                  disabled={isExecuting}
                  className="bg-slate-600 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer hover:bg-slate-700 active:bg-slate-800 transition-colors"
                >
                  {isExecuting && !isJudging ? "Running..." : "Run"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isExecuting}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  {isJudging ? "Judging..." : "Submit"}
                </button>
              </div>
            </div>

            <PanelGroup direction="vertical" className="flex-1 min-h-0 h-full">
              <Panel defaultSize={60} minSize={5}>
                <div className="h-full min-h-0">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={setCode}
                    options={{ readOnly: isExecuting }}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-slate-700 hover:bg-slate-600 transition-colors" />

              <Panel defaultSize={40} minSize={5}>
                <div className="h-full min-h-0 flex flex-col bg-slate-800">
                  <div className="flex-grow min-h-0 grid grid-cols-2 gap-1">
                    <div className="flex flex-col h-full min-h-0 overflow-hidden">
                      <div className="text-sm font-medium text-slate-300 px-3 py-2 bg-slate-700 border-b border-slate-600">
                        <label htmlFor="custom-input-desktop">Input (stdin)</label>
                      </div>
                      <textarea
                        id="custom-input-desktop"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter standard input for 'Run' here..."
                        className="flex-grow bg-[#1e1e1e] text-white font-mono resize-none border-none outline-none p-3 overflow-y-auto overflow-x-auto text-xs leading-tight placeholder-slate-400"
                        disabled={isExecuting}
                      />
                    </div>
                    
                    <div className="flex flex-col h-full min-h-0 overflow-hidden">
                      <div className="text-sm font-medium text-slate-300 px-3 py-2 bg-slate-700 border-b border-slate-600">
                        Output
                      </div>
                      <div className="flex-grow min-h-0 relative bg-[#1e1e1e] overflow-auto">
                        {submissionProgress ? (
                          <SubmissionProgress 
                            progress={submissionProgress} 
                            status={judgingStatus}
                            isJudging={isJudging}
                          />
                        ) : (
                          <pre className="h-full w-full text-white font-mono whitespace-pre-wrap p-3 text-xs leading-tight">
                            {output}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>

      {showAIModal && (
        <AIFeedbackModal
          submissionId={completedSubmissionId}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </div>
  );
}

export default ProblemDetailPage;