import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Ensure this import is present
import hljs from 'highlight.js/lib/core';

// Register languages you want to support
import python from 'highlight.js/lib/languages/python';
hljs.registerLanguage('python', python);

const SyntaxHighlightedQuillEditor = ({ value, onChange }) => {
  // Quill's syntax module requires 'highlight.js' to be available globally
  window.hljs = hljs;

  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      theme="snow"
      modules={{
        syntax: true, // Enable syntax highlighting
        toolbar: [
          ['code'], // Include code block button in the toolbar
        ],
      }}
    />
  );
};

export default SyntaxHighlightedQuillEditor;
