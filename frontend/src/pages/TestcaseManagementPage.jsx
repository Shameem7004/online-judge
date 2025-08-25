import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblemById } from '../api/problemApi';
import { getTestcasesByProblem, createTestcase, updateTestcase, deleteTestcase } from '../api/testcaseApi';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

function TestcaseManagementPage() {
  const { problemId: initialProblemId } = useParams();
  const navigate = useNavigate();
  const [problemId, setProblemId] = useState(initialProblemId);
  const [problem, setProblem] = useState(null);
  const [testcases, setTestcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    input: '', 
    output: '', 
    explanation: '', 
    isSample: false, 
    displayInput: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [problemRes, testcaseRes] = await Promise.all([
          getProblemById(problemId),
          getTestcasesByProblem(problemId)
        ]);
        setProblem(problemRes.data.problem);
        setTestcases(testcaseRes.data.testcases || []);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [problemId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleProblemIdChange = (e) => {
    setProblemId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateTestcase(problemId, editingId, form);
      } else {
        await createTestcase(problemId, form);
      }
      setForm({ input: '', output: '', explanation: '', isSample: false, displayInput: '' });
      setEditingId(null);
      const res = await getTestcasesByProblem(problemId);
      setTestcases(res.data.testcases || []);
    } catch (err) {
      setError('Failed to save testcase');
    }
  };

  const handleEdit = (tc) => {
    setForm({
      input: tc.input,
      output: tc.output,
      explanation: tc.explanation || '',
      isSample: tc.isSample || false,
      displayInput: tc.displayInput || ''
    });
    setEditingId(tc._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) {
      return;
    }
    try {
      await deleteTestcase(problemId, id);
      setTestcases(testcases.filter(tc => tc._id !== id));
    } catch {
      setError('Failed to delete testcase');
    }
  };

  const sampleTestcases = testcases.filter(tc => tc.isSample);
  const hiddenTestcases = testcases.filter(tc => !tc.isSample);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Manage Test Cases
        </h1>
        <p className="text-slate-600">
          Problem: <span className="font-medium text-slate-900">{problem?.name || 'Loading...'}</span>
        </p>
      </div>

      {/* Problem ID Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Problem Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="problem-id" className="block text-sm font-medium text-slate-700 mb-2">
                Problem ID
              </label>
              <input
                id="problem-id"
                type="text"
                value={problemId}
                onChange={handleProblemIdChange}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                placeholder="Enter problem ID to manage test cases"
              />
              <p className="text-xs text-slate-500 mt-1">
                You can edit the Problem ID to manage test cases for another problem.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-6">
              Back to Problem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Case Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">
            {editingId ? 'Edit Test Case' : 'Add New Test Case'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Case Type */}
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isSample" 
                  checked={form.isSample} 
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <span className="text-sm font-medium text-slate-700">Sample Test Case</span>
              </label>
              <div className="text-xs text-slate-500">
                Sample test cases are visible to users as examples
              </div>
            </div>

            {/* Input and Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="input" className="block text-sm font-medium text-slate-700 mb-2">
                  Input * <span className="text-slate-500">(Raw data for judge)</span>
                </label>
                <textarea 
                  id="input"
                  name="input" 
                  value={form.input} 
                  onChange={handleChange} 
                  required 
                  rows="8"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-mono text-sm"
                  placeholder="Enter the exact input data that will be fed to the program..."
                />
              </div>
              
              <div>
                <label htmlFor="output" className="block text-sm font-medium text-slate-700 mb-2">
                  Expected Output *
                </label>
                <textarea 
                  id="output"
                  name="output" 
                  value={form.output} 
                  onChange={handleChange} 
                  required 
                  rows="8"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-mono text-sm"
                  placeholder="Enter the expected output for this input..."
                />
              </div>
            </div>

            {/* Display Input (for samples) */}
            {form.isSample && (
              <div>
                <label htmlFor="displayInput" className="block text-sm font-medium text-slate-700 mb-2">
                  Display Input <span className="text-slate-500">(Formatted for user display)</span>
                </label>
                <textarea 
                  id="displayInput"
                  name="displayInput" 
                  value={form.displayInput} 
                  onChange={handleChange} 
                  rows="4"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-mono text-sm"
                  placeholder="Enter a pretty-formatted version of the input for display (optional)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  If provided, this will be shown to users instead of the raw input. Use for better readability.
                </p>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label htmlFor="explanation" className="block text-sm font-medium text-slate-700 mb-2">
                Explanation <span className="text-slate-500">(Optional)</span>
              </label>
              <textarea 
                id="explanation"
                name="explanation" 
                value={form.explanation} 
                onChange={handleChange} 
                rows="3"
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                placeholder="Explain why this output is correct for this input (helpful for sample cases)..."
              />
            </div>

            {error && (
              <div className="bg-rose-100 border border-rose-400 text-rose-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-4 pt-4">
              <Button
                type="submit"
                className="px-8 py-3 text-lg font-medium min-w-[200px]"
              >
                {editingId ? '✏️ Update Test Case' : '➕ Add Test Case'}
              </Button>
              
              {editingId && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ input: '', output: '', explanation: '', isSample: false, displayInput: '' });
                  }}
                  className="px-6 py-3"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Test Cases Display */}
      <div className="space-y-8">
        {/* Sample Test Cases */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
            Sample Test Cases 
            <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">
              {sampleTestcases.length}
            </span>
          </h2>
          
          {sampleTestcases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-slate-500">
                  No sample test cases added yet. Sample test cases are shown to users as examples.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sampleTestcases.map((tc, index) => (
                <Card key={tc._id} className="border-emerald-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-slate-800">Sample {index + 1}</h4>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(tc)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(tc._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold text-slate-700 mb-2">Input:</div>
                        <pre className="bg-slate-100 p-3 rounded border text-sm font-mono text-slate-900 whitespace-pre-wrap">
                          {tc.displayInput || tc.input}
                        </pre>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 mb-2">Output:</div>
                        <pre className="bg-slate-100 p-3 rounded border text-sm font-mono text-slate-900 whitespace-pre-wrap">
                          {tc.output}
                        </pre>
                      </div>
                    </div>
                    
                    {tc.explanation && (
                      <div className="mt-4">
                        <div className="font-semibold text-slate-700 mb-2">Explanation:</div>
                        <div className="text-slate-600 bg-blue-50 p-3 rounded border">
                          {tc.explanation}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Hidden Test Cases */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
            Judge Test Cases 
            <span className="ml-2 bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm font-medium">
              {hiddenTestcases.length}
            </span>
          </h2>
          
          {hiddenTestcases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-slate-500">
                  No judge test cases added yet. These test cases are used for evaluation but hidden from users.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {hiddenTestcases.map((tc, index) => (
                <Card key={tc._id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-slate-800">Test Case {index + 1}</h4>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(tc)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(tc._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold text-slate-700 mb-2">Input:</div>
                        <pre className="bg-slate-100 p-3 rounded border text-sm font-mono text-slate-900 whitespace-pre-wrap max-h-32 overflow-auto">
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 mb-2">Output:</div>
                        <pre className="bg-slate-100 p-3 rounded border text-sm font-mono text-slate-900 whitespace-pre-wrap max-h-32 overflow-auto">
                          {tc.output}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {testcases.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
          <div className="text-sm text-blue-800">
            <p>Total Test Cases: <span className="font-medium">{testcases.length}</span></p>
            <p>Sample Cases: <span className="font-medium">{sampleTestcases.length}</span> (visible to users)</p>
            <p>Judge Cases: <span className="font-medium">{hiddenTestcases.length}</span> (hidden from users)</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestcaseManagementPage;