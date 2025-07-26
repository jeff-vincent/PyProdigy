import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

const LabText = ({ labText }) => {
  console.log('LabText: Component initialized with labText:', labText);
  console.log('LabText: labText type:', typeof labText);
  console.log('LabText: labText length:', labText?.length);
  console.log('LabText: labText preview:', labText?.substring(0, 100));
  
  const labTextRef = useRef(null);

  const parseCodeBlocks = (labText) => {
    console.log('LabText: parseCodeBlocks called with:', typeof labText, labText?.length);
    
    if (!labText) {
      console.log('LabText: parseCodeBlocks - no labText provided, returning empty string');
      return '';
    }
    
    // Regex to identify pre elements and extract code content
    const preCodeBlockRegex = /<pre class="ql-syntax" spellcheck="false">([\s\S]+?)<\/pre>/g;
    const matches = labText.match(preCodeBlockRegex);
    console.log('LabText: parseCodeBlocks - regex matches found:', matches?.length || 0);
    
    const result = labText.replace(preCodeBlockRegex, (match, codeContent) => {
      console.log('LabText: parseCodeBlocks - replacing code block:', match.substring(0, 50));
      // Wrap the code content with code tags and remove class and spellcheck attributes
      const wrappedCode = `<pre class="language-python">${codeContent}</pre>`;
      console.log('LabText: parseCodeBlocks - wrapped code:', wrappedCode.substring(0, 50));
      return wrappedCode;
    });
    
    console.log('LabText: parseCodeBlocks - result length:', result?.length);
    console.log('LabText: parseCodeBlocks - result changed:', result !== labText);
    return result;
  };

  // Highlight code blocks using Prism.js
  useEffect(() => {
    console.log('LabText: useEffect triggered with labText:', !!labText);
    console.log('LabText: useEffect - labTextRef.current:', !!labTextRef.current);
    
    if (labTextRef.current && labText) {
      console.log('LabText: Highlighting code blocks');
      console.log('LabText: labTextRef.current children count:', labTextRef.current.children.length);
      // Highlight the code blocks using Prism.js
      try {
        Prism.highlightAllUnder(labTextRef.current);
        console.log('LabText: Prism highlighting completed successfully');
      } catch (error) {
        console.error('LabText: Prism highlighting error:', error);
      }
    } else {
      console.log('LabText: Skipping highlight - ref:', !!labTextRef.current, 'labText:', !!labText);
    }
  }, [labText]);

  if (!labText) {
    console.log('LabText: Showing loading state - no labText provided');
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    );
  }

  // Parse the lab text to replace code blocks with Prism.js compatible format
  const processedLabText = parseCodeBlocks(labText);
  console.log('LabText: Processed lab text length:', processedLabText?.length);
  console.log('LabText: Processed lab text preview:', processedLabText?.substring(0, 200));

  console.log('LabText: About to render component with content');
  console.log('LabText: Final render check - processedLabText exists:', !!processedLabText);
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
          Lab Content
        </h3>
      </div>
      
      <div className="p-6">
        <div 
          ref={labTextRef}
          className="prose prose-lg max-w-none
            prose-headings:text-gray-800 prose-headings:font-semibold
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-strong:text-gray-800
            prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-gray-900 prose-pre:text-green-400 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-ul:text-gray-700 prose-ol:text-gray-700
            prose-li:text-gray-700
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: processedLabText }}
        />
      </div>
    </div>
  );
};

export default LabText;
