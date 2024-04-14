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
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);

  const [currentPost, setCurrentPost] = useState({ content: '' });
  const [currentHTML, setCurrentHTML] = useState('');
  const [selectedTag, setSelectedTag] = useState(Tag.ALL);

  const listRef = useRef(null);
  const buttonRef = useRef(null);
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
    fetch('/wall_data.csv')
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
            setDisplayedPosts(sortedPosts);
            setCurrentPost(sortedPosts[0]);

            // setThoughts(
            //   sortedPosts.filter((post) => post.tags === Tag.THOUGHTS)
            // );
            // setLyrics(sortedPosts.filter((post) => post.tags === Tag.LYRICS));
            // setQuotes(sortedPosts.filter((post) => post.tags === Tag.QUOTES));
            // setMoments(sortedPosts.filter((post) => post.tags === Tag.MOMENTS));
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

  useEffect(() => {
    // Find the first post that matches the selectedTag
    if (allPosts.length > 0) {
      const firstPostOfTag =
        selectedTag === Tag.ALL
          ? allPosts[0]
          : allPosts.find((post) => post.tags === selectedTag);
      setCurrentPost(firstPostOfTag);
      listRef.current.scrollTop = 0;
    }
  }, [selectedTag, allPosts]);

  // mobile button to show list of posts
  // TODO: modify this to a permanent item
  const showList = () => {
    listRef.current.classList.toggle('mobile-show');
    buttonRef.current.classList.toggle('close-button-show');
  };

  // tag buttons to filter posts
  // const filterPosts = (tag) => {
  //   if (!listRef.current.classList.contains('post-list-mobile-show')) {
  //     listRef.current.classList.add('mobile-show');
  //     buttonRef.current.classList.add('close-button-show');
  //   }

  //   if (tag === Tag.THOUGHTS) {
  //     setDisplayedPosts(thoughts);
  //     setCurrentPost(thoughts[0]);
  //   } else if (tag === Tag.LYRICS) {
  //     setDisplayedPosts(lyrics);
  //     setCurrentPost(lyrics[0]);
  //   } else if (tag === Tag.QUOTES) {
  //     setDisplayedPosts(quotes);
  //     setCurrentPost(quotes[0]);
  //   } else if (tag === Tag.MOMENTS) {
  //     setCurrentPost(moments[0]);
  //   } else if (tag === Tag.ALL) {
  //     setDisplayedPosts(allposts);
  //     setCurrentPost(allposts[0]);
  //   }
  // };

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
      </nav>

      <div id="post-list" ref={listRef}>
        {displayedPosts.map((post, index) => (
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

      <button
        className="post-list-mobile-close"
        ref={buttonRef}
        onClick={(e) => showList()}
      >
        close
      </button>

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
            <div>
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
