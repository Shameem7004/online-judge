import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSubmissionById } from '../api/submissionApi';
import AIFeedbackModal from '../components/AIFeedbackModal'; 

// --- UI IMPROVEMENT: Helper icons for the copy-to-clipboard feature ---
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await getSubmissionById(id);
        setSubmission(res.data.submission);
      } catch (err) {
        setError(err.message || 'Error fetching submission');
        console.error("Error fetching submission:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  // --- UI IMPROVEMENT: Handler for the copy-to-clipboard functionality ---
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  };

  const getStatusColor = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'accepted':
        return 'text-emerald-600 font-semibold';
      case 'wrong answer':
        return 'text-rose-600 font-semibold';
      case 'time limit exceeded':
        return 'text-amber-600 font-semibold';
      case 'runtime error':
      case 'compilation error':
        return 'text-orange-600 font-semibold';
      default:
        return 'text-slate-600 font-semibold';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <p className="text-slate-700 text-lg">Loading submission...</p>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center p-8">
      <p className="text-rose-600 text-lg font-medium">Error: {error}</p>
    </div>
  );

  if (!submission) return (
    <div className="flex justify-center items-center p-8">
      <p className="text-slate-700 text-lg">Submission not found.</p>
    </div>
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Submission Details</h1>
            <button
              onClick={() => setShowAIModal(true)}
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h.008a5.995 5.995 0 005.992-5.992V8.337a1.337 1.337 0 00-1.337-1.337h-1.333V5.663a3.337 3.337 0 00-6.674 0v1.337H4.337A1.337 1.337 0 003 8.337v2.671a5.995 5.995 0 005.992 5.992h.671zM10 13.337a1.337 1.337 0 110-2.674 1.337 1.337 0 010 2.674z" />
              </svg>
              Get AI Feedback
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Problem</h2>
              <p className="text-slate-900 font-medium text-lg">{submission.problem?.name || 'N/A'}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Submission Info</h2>
              <div className="space-y-3">
                <p>
                  <span className="text-slate-600 font-medium">Status: </span>
                  <span className={getStatusColor(submission.verdict)}>
                    {submission.verdict}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600 font-medium">Language: </span>
                  <span className="font-semibold text-slate-800">{submission.language}</span>
                </p>
                <p>
                  <span className="text-slate-600 font-medium">Submitted At: </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(submission.createdAt).toLocaleString()}
                  </span>
                </p>
                {submission.testCasesPassed !== undefined && (
                  <p>
                    <span className="text-slate-600 font-medium">Test Cases: </span>
                    <span className="font-semibold text-slate-800">
                      {submission.testCasesPassed}/{submission.totalTestCases} passed
                    </span>
                  </p>
                )}
                {submission.executionTime && (
                  <p>
                    <span className="text-slate-600 font-medium">Execution Time: </span>
                    <span className="font-semibold text-slate-800">{submission.executionTime}ms</span>
                  </p>
                )}
                {submission.memory && (
                  <p>
                    <span className="text-slate-600 font-medium">Memory Used: </span>
                    <span className="font-semibold text-slate-800">{submission.memory}MB</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Code</h2>
              <button
                onClick={() => handleCopy(submission.code)}
                className="text-slate-500 hover:text-slate-800 transition-colors duration-200 p-1 rounded-md"
                title="Copy code"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-slate-100 text-sm whitespace-pre-wrap">{submission.code}</pre>
            </div>
          </div>

          {submission.testCaseResults && submission.testCaseResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Test Case Results</h2>
              <div className="space-y-4">
                {submission.testCaseResults.map((result, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-slate-800">Test Case {index + 1}</p>
                        <p className={`mt-1 font-semibold ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {result.passed ? '✓ Passed' : '✗ Failed'}
                        </p>
                      </div>
                      {(result.input || result.expectedOutput || result.userOutput) && (
                        <div className="space-y-2 text-sm">
                          <p><strong className="text-slate-700">Input:</strong> <span className="font-mono text-slate-800">{result.input}</span></p>
                          <p><strong className="text-slate-700">Expected:</strong> <span className="font-mono text-slate-800">{result.expectedOutput}</span></p>
                          <p><strong className="text-slate-700">Got:</strong> <span className="font-mono text-slate-800">{result.userOutput}</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* This now uses the upgraded modal */}
      {showAIModal && (
        <AIFeedbackModal
          submissionId={id}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </>
  );
}

export default SubmissionDetailPage;
