import { useState, useEffect } from 'react';
import { fetchGlossary } from '../api';
import { transformExplanation } from '../config/presenters';

function Glossary({ onBack, initialSearch = '', backLabel = '戻る', presenterMode = 'normal' }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState(initialSearch);
  const [expandedTerm, setExpandedTerm] = useState(null);

  useEffect(() => {
    loadGlossary();
  }, [selectedCategory]);

  async function loadGlossary() {
    setLoading(true);
    try {
      const data = await fetchGlossary(selectedCategory, null);
      setTerms(data);
    } catch (error) {
      console.error('用語集の取得に失敗:', error);
    }
    setLoading(false);
  }

  const filteredTerms = terms.filter(term => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      term.term.toLowerCase().includes(search) ||
      term.meaning.includes(searchText) ||
      term.description.includes(searchText)
    );
  });

  const categoryNames = {
    technology: 'テクノロジ系',
    management: 'マネジメント系',
    strategy: 'ストラテジ系'
  };

  if (loading) {
    return <div className="glossary-loading">読み込み中...</div>;
  }

  return (
    <div className="glossary">
      <h2>用語集</h2>

      <div className="glossary-filters">
        <div className="category-filter">
          <button
            className={selectedCategory === null ? 'active' : ''}
            onClick={() => setSelectedCategory(null)}
          >
            すべて
          </button>
          {Object.entries(categoryNames).map(([key, name]) => (
            <button
              key={key}
              className={selectedCategory === key ? 'active' : ''}
              onClick={() => setSelectedCategory(key)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="用語を検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="glossary-list">
        {filteredTerms.length === 0 ? (
          <p className="glossary-empty">該当する用語がありません</p>
        ) : (
          filteredTerms.map(term => (
            <div
              key={term.id}
              className={`glossary-item ${expandedTerm === term.id ? 'expanded' : ''}`}
            >
              <div
                className="glossary-header"
                onClick={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
              >
                <div className="term-main">
                  <span className="term-name">{term.term}</span>
                  {term.fullName && (
                    <span className="term-fullname">({term.fullName})</span>
                  )}
                </div>
                <div className="term-meaning">{term.meaning}</div>
                <span className="expand-icon">{expandedTerm === term.id ? '▼' : '▶'}</span>
              </div>

              {expandedTerm === term.id && (
                <div className="glossary-detail">
                  <div className="detail-section">
                    <h4>説明</h4>
                    <p>{transformExplanation(presenterMode, term.description)}</p>
                  </div>

                  {term.examples && term.examples.length > 0 && (
                    <div className="detail-section">
                      <h4>具体例</h4>
                      <ul>
                        {term.examples.map((ex, i) => (
                          <li key={i}>{transformExplanation(presenterMode, ex)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {term.tips && (
                    <div className="detail-section tips">
                      <h4>覚え方のコツ</h4>
                      <p>{transformExplanation(presenterMode, term.tips)}</p>
                    </div>
                  )}

                  {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <div className="detail-section">
                      <h4>関連用語</h4>
                      <div className="related-terms">
                        {term.relatedTerms.map((rt, i) => (
                          <span key={i} className="related-tag">{rt}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="term-category-badge">
                    {categoryNames[term.category]} / {term.subcategory}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="glossary-actions">
        <button onClick={onBack}>{backLabel}</button>
      </div>
    </div>
  );
}

export default Glossary;
