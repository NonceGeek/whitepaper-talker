import React, {useState} from 'react'
import { DocsThemeConfig, useTheme } from 'nextra-theme-docs'
import search from './pages/search'
import ReactMarkdown from 'react-markdown';

const questions = [
  'What is Aptos?',
  'How could I use Aptos CLI?'
]

interface EmbedbaseSearchBarProps {
  value?: string;
  onChange?: (e: any) => void;
  autoFocus?: boolean;
  placeholder?: string;
  onClick?: () => void;
}


const MarkdownComponents: object = {
  code({ node, inline, className, ...props }) {

    const match = /language-(\w+)/.exec(className || '')
    const hasMeta = node?.data?.meta

    const applyHighlights: object = (applyHighlights: number) => {
      if (hasMeta) {
        const RE = /{([\d,-]+)}/
        const metadata = node.data.meta?.replace(/\s/g, '')
        const strlineNumbers = RE?.test(metadata)
          ? RE?.exec(metadata)[1]
          : '0'
        const highlightLines = rangeParser(strlineNumbers)
        const highlight = highlightLines
        const data: string = highlight.includes(applyHighlights)
          ? 'highlight'
          : null
        return { data }
      } else {
        return {}
      }
    }

    return match ? (
      <SyntaxHighlighter
        children={""}
        style={oneDark}
        // language={match[1]}
        PreTag="div"
        className="codeStyle"
        // showLineNumbers={true}
        wrapLines={hasMeta ? true : false}
        useInlineStyles={true}
        lineProps={applyHighlights}
        {...props}
      />
    ) : (
      <code className={className} {...props} />
    )
  },
}

const EmbedbaseSearchBar = ({ value, onChange, autoFocus, placeholder, onClick }: EmbedbaseSearchBarProps) => {
  return (
    <input
      autoFocus={autoFocus || false}
      placeholder={placeholder || "Search..."}
      onClick={onClick}
      type="text"
      value={value}
      onChange={onChange}
      // border around with smooth corners, a magnifier icon on the left,
      // the search bar taking up the rest of the space
      // focused on load
      style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', outline: 'none' }}
    />
  );
};

const Modal = ({ children, open, onClose }) => {
  const theme = useTheme();
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: theme.theme === 'dark' ? '#1a1a1a' : 'white',
          padding: 20,
          borderRadius: 5,
          width: '80%',
          maxWidth: 700,
          maxHeight: '80%',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

//search modal

const SearchModal = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
    setPrompt("");
    setOutput("");
    setLoading(false);
  }

  const qa = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");
    const searchResp = await search(prompt);
    // get pure.
    let similarities_handled = [];
    for(let i in searchResp.similarities){
      similarities_handled.push(searchResp.similarities[i].data);
    }
    console.log(JSON.stringify(similarities_handled));
    let prompt_finally = "Here are the contents:\n\n"
    for(let i in similarities_handled){
      prompt_finally = prompt_finally + "* " + similarities_handled[i] + "\n\n";
    }
    prompt_finally += "So the question is: " + prompt;
    setOutput(prompt_finally);

    setLoading(false);
  };
  // a nice looking input search bar with cmd k to open
  // on open, show a modal with a form to enter a prompt
  return <div>
    {/* on click, open modal */}
    <EmbedbaseSearchBar onClick={() => setOpen(true)} placeholder="Ask a question..." />
    <Modal open={open} onClose={onClose}>
      <form onSubmit={qa} className="nx-flex nx-gap-3">
        <EmbedbaseSearchBar value={prompt} onChange={(e) => setPrompt(e.target.value)} autoFocus />
        <button
          className="nx-rounded-full nx-bg-sky-300 nx-py-2 nx-px-4 nx-text-sm nx-font-semibold nx-text-slate-900 nx-hover:nx-bg-sky-200 nx-focus:outline-none focus-visible:outline-2 focus-visible:nx-outline-offset-2 nx-focus-visible:nx-outline-sky-300/50 nx-active:bg-sky-500 nx-max-w-max"
          type="submit"
        >
          Ask
        </button>
      </form>
      {/* row oriented, centered, with a gap of 3 */}
      <div className="nx-flex nx-gap-3 nx-py-4 nx-min-h-40 nx-flex-col">
        {!loading && output.length < 1 && (
          <div className="nx-text-gray-400	nx-text-sm nx-font-semibold">
            Your result will appear here

          </div>
        )}
        {loading && (
          <div className="nx-flex nx-items-center nx-justify-center">
            <span>Loading...</span>
            <div
              style={{
                width: "1rem",
                height: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "50%",
                borderTopColor: "black",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        )}

        {!loading && output.length > 0 && (
          <div>
          <ReactMarkdown
            components={MarkdownComponents}
          >{output}</ReactMarkdown>
            <a href="https://chat.openai.com/" target="_blank">
              <button
                className="nx-rounded-full nx-bg-sky-300 nx-py-2 nx-px-4 nx-text-sm nx-font-semibold nx-text-slate-900 nx-hover:nx-bg-sky-200 nx-focus:outline-none focus-visible:outline-2 focus-visible:nx-outline-offset-2 nx-focus-visible:nx-outline-sky-300/50 nx-active:bg-sky-500 nx-max-w-max"
              >
                Visit ChatGPT to Ask!
              </button>
            </a>
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          marginTop: "1rem",
        }}
      >
        {/* try one of these samples */}
        <div className="nx-mt-2">Try one of these samples:</div>
        <div
          style={{
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 600,
          }}
          // examples as a list of bullets
          className="nx-flex-row"
        >
          <ul>
            {questions.map((q) => (
              // in row orientation, centered, with a gap of 3
              <li key={q} onClick={() => setPrompt(q)}>
                * {q}
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem 0",
            fontSize: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.25rem",
            }}
          >
            <a href="https://movespace.xyz" className="underline">
              Powered by MoveSpace.xyz & Embedbase
            </a>
          </div>
        </div>
      </div>
    </Modal>
  </div>
};

// basic config 
const config: DocsThemeConfig = {
  logo: <span>My Project</span>,
  project: {
    link: 'https://github.com/shuding/nextra-docs-template',
  },
  chat: {
    link: 'https://discord.com',
  },
  docsRepositoryBase: 'https://github.com/shuding/nextra-docs-template',
  footer: {
    text: 'Nextra Docs Template',
  },
  search: {
    component: <SearchModal />
  },
}

export default config
