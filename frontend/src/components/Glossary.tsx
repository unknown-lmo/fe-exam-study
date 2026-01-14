import { useState, useEffect } from 'react';
import { fetchGlossary } from '../api';
import { CATEGORY_NAMES } from '../constants';
import type { GlossaryTerm, CategoryId, Character, PresenterMode } from '../types';

interface GlossaryProps {
  onBack: () => void;
  initialSearch?: string;
  backLabel?: string;
  presenterMode?: PresenterMode;
  activeCharacter?: Character;
  transformExplanation?: (text: string) => string;
}

function Glossary({
  onBack,
  initialSearch = '',
  backLabel = '戻る',
  presenterMode: _presenterMode = 'normal',
  activeCharacter: _activeCharacter,
  transformExplanation = (text: string) => text
}: GlossaryProps) {
  // These props are received for API compatibility but not used currently
  void _presenterMode;
  void _activeCharacter;
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [searchText, setSearchText] = useState(initialSearch);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

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
          {(Object.entries(CATEGORY_NAMES) as [CategoryId, string][]).map(([key, name]) => (
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
                    <p>{transformExplanation(term.description)}</p>
                  </div>

                  {term.examples && term.examples.length > 0 && (
                    <div className="detail-section">
                      <h4>具体例</h4>
                      <ul>
                        {term.examples.map((ex, i) => (
                          <li key={i}>{transformExplanation(ex)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {term.tips && (
                    <div className="detail-section tips">
                      <h4>覚え方のコツ</h4>
                      <p>{transformExplanation(term.tips)}</p>
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
                    {CATEGORY_NAMES[term.category]} / {term.subcategory}
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
