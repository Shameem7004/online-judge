import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAIAnalysis } from '../api/aiApi';

// Enhanced loading spinner with better styling
const Spinner = () => (
  <div className="flex flex-col justify-center items-center h-full my-12">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0"></div>
    </div>
    <p className="mt-6 text-gray-600 font-medium">🤖 AI is analyzing your code...</p>
    <p className="mt-2 text-sm text-gray-500">This may take a few seconds</p>
  </div>
);

function AIFeedbackModal({ submissionId, onClose }) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('prompt'); // 'prompt', 'loading', 'analysis', 'error'

  const handleRequestAnalysis = async () => {
    setView('loading');
    setIsLoading(true);
    try {
      const res = await getAIAnalysis(submissionId);
      setAnalysis(res.data.analysis);
      setView('analysis');
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while generating the analysis.");
      setView('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'prompt':
        return (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get AI Code Review</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your submission has been judged successfully! Would you like our AI to analyze your code and provide personalized feedback to help you improve?
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complexity analysis of your solution</li>
                <li>• Suggestions for performance improvements</li>
                <li>• Code quality and style recommendations</li>
                <li>• Alternative approaches when applicable</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <button 
                onClick={onClose} 
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
              >
                Maybe Later
              </button>
              <button 
                onClick={handleRequestAnalysis} 
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze My Code
              </button>
            </div>
          </div>
        );
      
      case 'loading':
        return <Spinner />;
      
      case 'error':
        return (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
            <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>
            <button 
              onClick={handleRequestAnalysis}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      
      case 'analysis':
        return (
          <div className="max-h-[70vh] overflow-y-auto">
            <article className="prose prose-lg prose-indigo max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold text-gray-800 mb-3 mt-6 flex items-center gap-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700">{children}</ol>,
                  li: ({children}) => <li className="ml-2">{children}</li>,
                  strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  code: ({inline, children}) => (
                    inline 
                      ? <code className="bg-gray-100 text-indigo-600 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                      : <code className="block bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre">{children}</code>
                  ),
                  pre: ({children}) => <div className="my-4">{children}</div>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
                  hr: () => <hr className="my-6 border-gray-200" />,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </article>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI Code Feedback</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-hidden">
          {renderContent()}
        </div>

        {/* Footer - only show for analysis view */}
        {view === 'analysis' && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              💡 This analysis is AI-generated and may not be perfect. Use it as a learning guide.
            </p>
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFeedbackModal;