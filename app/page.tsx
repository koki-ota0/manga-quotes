'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [containerHeight, setContainerHeight] = useState('auto');

  useEffect(() => {
    let quotes = [];
    const gridSize = 20; // グリッドのサイズ
    
    fetch('/quotes.json')
      .then(response => response.json())
      .then(data => {
        quotes = data.quotes;
        generateQuotes(quotes);
      })
      .catch(error => console.error('Error loading quotes:', error));

    function generateQuotes(quotes) {
      const container = document.getElementById('container');
      if (!container) return;
      container.innerHTML = '';

      const grid = [];
      let y_bottom = 100; // コンテナの高さ

      quotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote';
        quoteElement.textContent = quote.text;

        const minFontSize = 10;
        const maxFontSize = 40;
        const fontSize = Math.floor(minFontSize + Math.pow(Math.random(), 2) * (maxFontSize - minFontSize));
        quoteElement.style.fontSize = `${fontSize}px`;

        // 要素のサイズを取得するために一時的にDOMに追加
        container.appendChild(quoteElement);
        const rect = quoteElement.getBoundingClientRect();
        container.removeChild(quoteElement);

        const width = Math.ceil(rect.width / gridSize);
        const height = Math.ceil(rect.height / gridSize);

        // グリッド上で配置可能な場所を探す
        let placed = false;
        for (let y = 0; y < 100000 - height; y++) {
          for (let x = 0; x < Math.ceil(container.clientWidth / gridSize) - width; x++) {
            if (canPlace(x, y, width, height)) {
              place(x, y, width, height);
              quoteElement.style.left = `${x * gridSize}px`;
              quoteElement.style.top = `${y * gridSize}px`;
              container.appendChild(quoteElement);
              placed = true;
              if (y * gridSize + rect.height > y_bottom) {
                y_bottom = y * gridSize + rect.height;
              }
              break;
            }
          }
          if (placed) break;
        }
      });

      // コンテナの高さを更新
      setContainerHeight(`${y_bottom / 5}vh`);

      function canPlace(x, y, width, height) {
        for (let i = y; i < y + height; i++) {
          for (let j = x; j < x + width; j++) {
            if (grid[i] && grid[i][j]) return false;
          }
        }
        return true;
      }

      function place(x, y, width, height) {
        for (let i = y; i < y + height; i++) {
          if (!grid[i]) grid[i] = [];
          for (let j = x; j < x + width; j++) {
            grid[i][j] = true;
          }
        }
      }
    }

    function handleResize() {
      generateQuotes(quotes);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      id="container"
      style={{
        position: 'relative',
        width: 'calc(100% - 40px)',
        height: containerHeight,
        overflowY: 'auto', // スクロールを許可
        overflowX: 'hidden', // 横方向のスクロールを防ぐ
      }}
    />
  );
}
