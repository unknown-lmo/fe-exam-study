import { useState, useEffect, useMemo } from 'react';
import { fetchGlossary } from '../api';
import { CATEGORY_NAMES } from '../constants';
import { useDebounce } from '../hooks/useDebounce';
import type { GlossaryTerm, CategoryId, Character, PresenterMode } from '../types';
import styles from './Glossary.module.css';

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

  // 検索テキストをデバウンス（300ms）
  const debouncedSearchText = useDebounce(searchText, 300);

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

  // フィルタリング結果をメモ化
  const filteredTerms = useMemo(() => {
    return terms.filter(term => {
      if (!debouncedSearchText) return true;
      const search = debouncedSearchText.toLowerCase();
      return (
        term.term.toLowerCase().includes(search) ||
        term.meaning.includes(debouncedSearchText) ||
        term.description.includes(debouncedSearchText)
      );
    });
  }, [terms, debouncedSearchText]);

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>用語集</h2>

      <div className={styles.filters}>
        <div className={styles.categoryFilter}>
          <button
            className={`${styles.categoryButton} ${selectedCategory === null ? styles.active : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            すべて
          </button>
          {(Object.entries(CATEGORY_NAMES) as [CategoryId, string][]).map(([key, name]) => (
            <button
              key={key}
              className={`${styles.categoryButton} ${selectedCategory === key ? styles.active : ''}`}
              onClick={() => setSelectedCategory(key)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="用語を検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            aria-label="用語を検索"
          />
        </div>
      </div>

      <div className={styles.list}>
        {filteredTerms.length === 0 ? (
          <p className={styles.empty}>該当する用語がありません</p>
        ) : (
          filteredTerms.map(term => (
            <div
              key={term.id}
              className={`${styles.item} ${expandedTerm === term.id ? styles.expanded : ''}`}
            >
              <div
                className={styles.itemHeader}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpandedTerm(expandedTerm === term.id ? null : term.id);
                  }
                }}
                aria-expanded={expandedTerm === term.id}
              >
                <div className={styles.termMain}>
                  <span className={styles.termName}>{term.term}</span>
                  {term.fullName && (
                    <span className={styles.termFullname}>({term.fullName})</span>
                  )}
                </div>
                <div className={styles.termMeaning}>{term.meaning}</div>
                <span className={styles.expandIcon}>{expandedTerm === term.id ? '▼' : '▶'}</span>
              </div>

              {expandedTerm === term.id && (
                <div className={styles.detail}>
                  <div className={styles.detailSection}>
                    <h4>説明</h4>
                    <p>{transformExplanation(term.description)}</p>
                  </div>

                  {term.examples && term.examples.length > 0 && (
                    <div className={styles.detailSection}>
                      <h4>具体例</h4>
                      <ul>
                        {term.examples.map((ex, i) => (
                          <li key={i}>{transformExplanation(ex)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {term.tips && (
                    <div className={`${styles.detailSection} ${styles.tips}`}>
                      <h4>覚え方のコツ</h4>
                      <p>{transformExplanation(term.tips)}</p>
                    </div>
                  )}

                  {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <div className={styles.detailSection}>
                      <h4>関連用語</h4>
                      <div className={styles.relatedTerms}>
                        {term.relatedTerms.map((rt, i) => (
                          <span key={i} className={styles.relatedTag}>{rt}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.categoryBadge}>
                    {CATEGORY_NAMES[term.category]} / {term.subcategory}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={onBack}>{backLabel}</button>
      </div>
    </div>
  );
}

export default Glossary;
