import { useEffect, useState, useRef } from 'react';

import { marked } from 'marked';
import Papa from 'papaparse';
import { sanitize } from 'dompurify';
import { Slider } from '@mui/material';

import './index.css';

const Tag = {
  ALL: 'all',
  THOUGHTS: 'thoughts',
  LYRICS: 'lyrics',
  QUOTES: 'quotes',
  MOMENTS: 'moments',
};

function App() {
  const [allPosts, setAllPosts] = useState([]);

  const [currentPost, setCurrentPost] = useState({ content: '' });
  const [currentHTML, setCurrentHTML] = useState('');
  const [selectedTag, setSelectedTag] = useState(Tag.ALL);

  const listRef = useRef(null);
  const overallRef = useRef(null);

  const [fontSize, setFontSize] = useState([100]);
  const [letterSpacing, setLetterSpacing] = useState([-0.05]);
  const [lineHeight, setLineHeight] = useState([0.9]);

  const formatTime = (time) => {
    const date = new Date(time);

    const formattedDate = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${formattedDate}, ${formattedTime}`;
  };

  // hook to get data from csv
  useEffect(() => {
    fetch('https://rencewang.github.io/wall-2022/wall_data.csv')
      .then((response) => response.text())
      .then((data) => {
        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const postsData = results.data.map((row) => ({
              id: row.id,
              content: row.content,
              tags: row.tags,
              created_at: row.created_at,
              time: formatTime(row.created_at),
            }));

            const sortedPosts = postsData.sort((a, b) => {
              return new Date(b.created_at) - new Date(a.created_at);
            });
            setAllPosts(sortedPosts);
            setCurrentPost(sortedPosts[0]);
          },
        });
      });
  }, []);

  // hook for changing post content that is displayed
  useEffect(() => {
    const html = marked.parse(currentPost.content);
    const sanitized = html
      ? sanitize(html)
      : "<p>This is the wall onto which I throw my random daily ideas and playlists and audio clips and quotes. It's built with Create React App and AWS, and the design is inspired by type foundry websites, so you can edit the text and change its appearance :)</p>";

    setCurrentHTML(sanitized);
  }, [currentPost]);

  // set currentPost to first post of selected tag
  useEffect(() => {
    if (allPosts.length > 0) {
      const firstPostOfTag =
        selectedTag === Tag.ALL
          ? allPosts[0]
          : allPosts.find((post) => post.tags === selectedTag);
      setCurrentPost(firstPostOfTag);
      listRef.current.scrollTop = 0;
    }
  }, [selectedTag, allPosts]);

  // make sure mobile height sizing is correct
  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
  }

  function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
      getWindowDimensions()
    );
    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }
      window.addEventListener('resize', handleResize);
      if (windowDimensions.width < 850) {
        setFontSize([65]);
      }
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowDimensions;
  }

  const { height, width } = useWindowDimensions();
  useEffect(() => {
    overallRef.current.style.height = height + 'px';
  }, [height, width]);

  return (
    <div id="overall" ref={overallRef}>
      <nav id="post-nav">
        <button onClick={(e) => setSelectedTag(Tag.ALL)}>All</button>
        <button onClick={(e) => setSelectedTag(Tag.THOUGHTS)}>Thoughts</button>
        <button onClick={(e) => setSelectedTag(Tag.MOMENTS)}>Moments</button>
        <button onClick={(e) => setSelectedTag(Tag.LYRICS)}>Lyrics</button>
        <button onClick={(e) => setSelectedTag(Tag.QUOTES)}>Quotes</button>
        <button onClick={(e) => console.log('abc')} id="info-button">
          Info
        </button>
        <span id="info">
          This is the wall onto which I throw my random daily ideas and
          playlists and audio clips and quotes. It's built with Create React App
          and AWS, and the design is inspired by type foundry websites, so you
          can edit the text and change its appearance :) <br /> <br />
          No longer updated as of 2024, please visit wall.rence.la for the new
          wall
        </span>
      </nav>

      <div id="post-list" ref={listRef}>
        {allPosts.map((post, index) => (
          <h2
            key={index}
            style={{
              backgroundColor:
                currentPost.id === post.id ? 'var(--blue)' : 'transparent',
              pointerEvents:
                selectedTag === post.tags || selectedTag === Tag.ALL
                  ? 'auto'
                  : 'none',
            }}
          >
            <button
              onClick={(e) => setCurrentPost(post)}
              style={{
                color:
                  currentPost.id === post.id ? 'var(--white)' : 'var(--blue)',
                opacity:
                  selectedTag === post.tags || selectedTag === Tag.ALL
                    ? 1
                    : 0.3,
              }}
            >
              {post.time}
            </button>
          </h2>
        ))}
      </div>

      <div id="post-content">
        <div id="post-area">
          <div
            id="post-markdown"
            contentEditable={true}
            spellCheck={false}
            style={{
              fontSize: `${fontSize}px`,
              letterSpacing: `${letterSpacing}em`,
              lineHeight: `${lineHeight}`,
            }}
            dangerouslySetInnerHTML={{ __html: currentHTML }}
          />

          {currentPost.tags && (
            <div style={{ marginBotton: '30px' }}>
              <span id="post-info">
                Recorded on {currentPost.created_at} in {currentPost.tags}
              </span>
            </div>
          )}
        </div>

        <div id="post-resize">
          <div>
            <div className="icon">font size</div>
            <div className="slider">
              <Slider
                value={fontSize}
                defaultValue={100}
                min={30}
                max={200}
                step={1}
                onChange={(e, data) => setFontSize(data)}
              />
            </div>
            <div className="label">{fontSize}px</div>
          </div>

          <div>
            <div className="icon">letter spacing</div>
            <div className="slider">
              <Slider
                value={letterSpacing}
                defaultValue={0}
                min={-0.1}
                max={0.1}
                step={0.01}
                onChange={(e, data) => setLetterSpacing(data)}
              />
            </div>
            <div className="label">{Number(letterSpacing).toFixed(2)}</div>
          </div>

          <div>
            <div className="icon">line height</div>
            <div className="slider">
              <Slider
                value={lineHeight}
                defaultValue={1}
                min={0.5}
                max={3}
                step={0.01}
                onChange={(e, data) => setLineHeight(data)}
              />
            </div>
            <div className="label">{Number(lineHeight).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
